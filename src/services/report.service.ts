import { inject, injectable } from 'inversify';

import { KpiFactory } from '../app_modules/kpis/queries/kpi.factory';
import { CurrentUser } from '../domain/app/current-user';
import { KPIs } from '../domain/app/kpis/kpi.model';
import { Logger } from '../domain/app/logger';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { IKPIDocument, KPITypeEnum, IKPISimpleDefinition } from '../domain/app/kpis/kpi';
import { DateRange, ChartDateRange } from '../app_modules/shared/shared.types';
import { IChartDateRange } from '../domain/common/date-range';
import { KPIExpressionHelper } from '../domain/app/kpis/kpi-expression.helper';
import { IVirtualSourceDocument } from '../domain/app/virtual-sources/virtual-source';
import { AggregateStage } from '../app_modules/kpis/queries/aggregate';
import { IKeyValues, IProcessAggregateResult, VirtualSourceAggregateService, AggPlaceholderTypeEnum } from '../domain/app/virtual-sources/vs-aggregate.service';
import { DateService } from './date/date-service';
import { KPIFilterHelper } from '../domain/app/kpis/kpi-filter.helper';
import { Schema } from 'mongoose';
import { isEmpty, sumBy, set } from 'lodash';

export interface IReportReq {
    'title': {
        'text': 'Report Title',
        'align': 'left|center|right',
        'style': string[]; //  [normal|underlined|italic|bold]
    };
    'dataSource': 'appointments';
    'cultureInfo': {
        'dateFormat': 'string',
        'currencySymbol': '$',
        'separators': {
            'decimal': '.',
            'thousand': ','
        }
    };
    'timezone': 'string';
    'dateRange': {
        'predefined': 'last month';
    };
    'filter': { /* ... */ };
    'columns': [
        {
            'fieldPath': 'firstName',
            'title': 'First Name',
            'type': 'string',
            'align': 'left|center|right',
            'format': 'capitalize|uppercase|lowercase',
            'style':  string[],    // [normal|underlined|italic|bold]
            'replacements': {
                'undefined': 'something else',
                'null': 'null',
                'botox': 'MY BOTOX',
            },
            'sort': 'asc',
            'position': 1,
            'width': 100
        },
        {
            'fieldPath': 'amount',
            'title': 'Price',
            'type': 'number',
            'align': 'left|center|right',
            'format': 'integer|percent|currency',
            'style': 'normal|italic|bold',
            'position': 2,
            'aggregate': 'sum',
            'width': 100
        },
        {
            'fieldPath': 'timestamp',
            'title': 'Timestamp',
            'type': 'date',
            'align': 'left|center|right',
            'format': 'MM/DD/YYYY|YYYY|MM/DD',
            'style': 'normal|italic|bold',
            'position': 3,
            'width': 100
        }
    ];
    'groupings': [
        {
            'fieldPath': 'location.name',
            'headerFormat': 'Location: {value}',
            'order': 1
        }
    ];
}

export interface IReportResponse {
    title: {
        plain: string;
        html: string;        // html string
    };
    dateStart: Date;
    dateEnd: Date;
    generatedAt: Date;
    generatedBy: String;    //
    columns: {
        title: {
            plain: string;
            html: string;
        },

    };

    // need to work on this for the real report engine, it's on the white board

}

export interface IReportColumn {
  name: string;
  path: string;
  type: string;
  isArray: boolean;
}

export interface IReportOptions {
    dataSource: string;
    dateRange: IChartDateRange;
    timezone: string;
    filter: any;
    fields: string[];
}

export interface IReportResult {
    name?: string;
    columns: IReportColumn[];
    rows: any[];
}

@injectable()
export class ReportService {

    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources,
        @inject(VirtualSourceAggregateService.name) private _vsAggregateService: VirtualSourceAggregateService,
        @inject(DateService.name) private dateService: DateService,
    ) {
    }

    async run(options: IReportOptions): Promise<IReportResult> {
        const { dataSource, dateRange, filter,  fields, timezone } = options;

        try {
            const vs = await this._virtualSources.model.findOne({name: { $regex: new RegExp(`^${dataSource}$`, 'i')}});

            // it's ok if the parent virtual source is null, is handled inside _getReportDataMethod
            const parentVs = await this._virtualSources.model.findOne({ name: vs.source.toLowerCase() }).lean() as IVirtualSourceDocument;

            let columns = this._getReportColumns(vs, fields);
            const rows = await this._getReportData(vs, parentVs, dateRange, timezone, filter, columns);

            return { columns, rows };
        } catch (err) {
            this._logger.error(err);
            return null;
        }
    }

    private _getReportColumns(vs: IVirtualSourceDocument, fields: string[]): IReportColumn[] {
        const columns = [];

        const sortedFields = Object.keys(vs.fieldsMap).sort();

        for (let i = 0; i < sortedFields.length; i++) {
            const value = vs.fieldsMap[sortedFields[i]];

            if (!fields.some(path => path === value.path)) { continue; }

            const column: IReportColumn = {
                name: sortedFields[i],
                path: value.path,
                type: value.dataType,
                isArray: !!value.isArray
            };

            columns.push(column);
        }

        return columns;
    }

    private async _getReportData(
        vs: IVirtualSourceDocument,
        parentVs: IVirtualSourceDocument,
        dateRange: IChartDateRange,
        timezone: string,
        filter: any,
        columns: IReportColumn[]
    ): Promise<any[]> {
        let aggregate: AggregateStage[] = [];

        const parsedDateRange = this.dateService.getDateRange(dateRange);

        const vsAggregateReplacements: IKeyValues = {
            '__from__': parsedDateRange.from,
            '__to__': parsedDateRange.to,
            '__timezone__': timezone
        };

        let aggregateResult: IProcessAggregateResult = {
            aggregate: [],
            appliedReplacements: []
        };

        let dateRangeApplied = false;

        aggregateResult = this._vsAggregateService.processReplacements(
            vs, vsAggregateReplacements
        );

        aggregate = aggregateResult.aggregate;

        dateRangeApplied
            = aggregateResult.appliedReplacements
                .filter(r => r.type === AggPlaceholderTypeEnum.dateRange).length > 0;

        if (!dateRangeApplied) {
            aggregateResult = this._vsAggregateService.tryDateRangeAsFirstStage(
                aggregate,
                vs,
                parentVs,
                parsedDateRange
            );
        }

        dateRangeApplied
            = aggregateResult.appliedReplacements
                             .filter(r => r.type === AggPlaceholderTypeEnum.dateRange).length > 0;

        // at this point we have the aggregate of the virtual source (if any) already processed

        const reportAggregate: AggregateStage[]  =  [];


        const matchStage = { $match: {}};

        if (!dateRangeApplied) {
            matchStage.$match[vs.dateField] = {
                '$gte':  parsedDateRange.from,
                '$lt':   parsedDateRange.to
            };
        }

        // add the filters if any
        const filters = filter;

        if (!isEmpty(filters)) {
            for (const [k, v] of Object.entries(filters)) {
                matchStage.$match[k] = v;
            }
        }

        if (!dateRangeApplied || !isEmpty(filters)) {
            reportAggregate.push(matchStage);
        }

        // add the projection
        const projectStage = { $project: { _id: 0 }};

        for (const column of columns) {
            projectStage.$project[column.path] = 1;
        }

        reportAggregate.push(projectStage);

        const finalAggregate = aggregate.concat(reportAggregate);

        const model = vs.db.model(
            vs.modelIdentifier,
            new Schema({}, { strict: false }),
            vs.source
        );

        try {
            const result = await model.aggregate(...finalAggregate).allowDiskUse(true).exec();
            return result;
        } catch (err) {
            this._logger.error(err);
            return null;
        }
    }

}

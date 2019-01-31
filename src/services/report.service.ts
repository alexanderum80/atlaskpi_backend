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

export interface IReportColumn {
  name: string;
  path: string;
  type: string;
}

export interface IReportOptions {
    kpi: IKPIDocument;
    dateRange: IChartDateRange;
    fullPathFields: string[];
}

export interface IReportResult {
    name?: string;
    columns: IReportColumn[];
    rows: any[];
}

@injectable()
export class ReportService {
    private _timezone: string;

    constructor(
        @inject(CurrentUser.name) private _currentUser: CurrentUser,
        @inject(Logger.name) private _logger: Logger,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources,
        @inject(VirtualSourceAggregateService.name) private _vsAggregateService: VirtualSourceAggregateService,
        @inject(DateService.name) private dateService: DateService,
    ) {
      this._timezone = this._currentUser.get().profile.timezone;
    }

    async generateReport(options: IReportOptions): Promise<IReportResult> {
        const { kpi, dateRange, fullPathFields } = options;

        const expression = KPIExpressionHelper.DecomposeExpression(<KPITypeEnum>kpi.type, kpi.expression) as IKPISimpleDefinition;

        try {
            const vs = await this._virtualSources.model.findOne({
                name: { $regex: new RegExp(`^${expression.dataSource}$`, 'i')}
            });

            // it's ok if the parent virtual source is null, is handled inside _getReportDataMethod
            const parentVs = await this._virtualSources.model.findOne({ name: vs.source.toLowerCase() });

            let columns = this._getReportColumns(vs, [...fullPathFields, expression.field]);
            columns = this._moveAmountColumnToEnd(columns, expression.field);
            const rows = await this._getReportData(vs, parentVs, kpi, dateRange, columns);

            // add a row with the total of the expression field
            const totalRow = this._generateTotalRow(columns, rows, expression, fullPathFields);

            rows.push(totalRow);

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
                type: value.dataType
            };

            columns.push(column);
        }

        return columns;
    }

    private async _getReportData(
        vs: IVirtualSourceDocument,
        parentVs: IVirtualSourceDocument,
        kpi: IKPIDocument,
        dateRange: IChartDateRange,
        columns: IReportColumn[]
    ): Promise<any[]> {
        let aggregate: AggregateStage[] = [];

        const parsedDateRange = this.dateService.getDateRange(dateRange);

        const vsAggregateReplacements: IKeyValues = {
            '__from__': parsedDateRange.from,
            '__to__': parsedDateRange.to,
            '__timezone__': this._timezone
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
        const filters = kpi.filter && KPIFilterHelper.cleanFilter(kpi.filter);

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

    private _generateTotalRow(columns: IReportColumn[], rows: any[], expression: IKPISimpleDefinition, fullPathFields: string[], ): any {
        const total = sumBy(rows, expression.field);
        const lastColumn = columns[columns.length - 2];

        let totalRow = { };

        for (let i = 0; i < fullPathFields.length; i++) {
            totalRow[fullPathFields[0]] = '';
        }

        set(totalRow, lastColumn.path, 'TOTAL');
        set(totalRow, expression.field, total);

        return totalRow;
    }

    private _moveAmountColumnToEnd(columns: IReportColumn[], amountField: string): IReportColumn[] {
        return [
            ...columns.filter(c => c.path !== amountField),
            ...columns.filter(c => c.path === amountField)
        ];
    }
}

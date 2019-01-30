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
import { isEmpty } from 'lodash';

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

            const columns = this._getReportColumns(vs, [...fullPathFields, expression.field]);
            const rows = await this._getReportData(vs, parentVs, kpi, dateRange, columns);

            return { columns, rows };
        } catch (err) {
            this._logger.error(err);
            return null;
        }
    }


    private _getReportColumns(vs: IVirtualSourceDocument, fullPathFields: string[]): IReportColumn[] {
        const columns = [];

        for (const [key, value] of Object.entries(vs.fieldsMap)) {
            if (!fullPathFields.some(path => path === value.path)) { continue; }

            const column: IReportColumn = {
                name: key,
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


        // add the filters if any
        const filters = kpi.filter && KPIFilterHelper.cleanFilter(kpi.filter);

        if (!isEmpty(filters)) {
            const matchStage = { $match: {}};

            for (const [k, v] of Object.entries(filters)) {
                matchStage.$match[k] = v;
            }

            reportAggregate.push(matchStage);
        }

        // add the projection
        const projectStage = { $project: { _id: null }};

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

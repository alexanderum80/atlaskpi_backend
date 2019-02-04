import { inject, injectable } from 'inversify';
import { set, sumBy } from 'lodash';

import { IFunnel } from '../../../domain/app/funnels/funnel';
import { Funnels } from '../../../domain/app/funnels/funnel.model';
import { IKPIDocument, KPITypeEnum } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { Logger } from '../../../domain/app/logger';
import { IVirtualSourceDocument } from '../../../domain/app/virtual-sources/virtual-source';
import { VirtualSources } from '../../../domain/app/virtual-sources/virtual-source.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FunnelsService, IFunnelStageDetails } from '../../../services/funnels.service';
import { KpiService } from '../../../services/kpi.service';
import { ReportService, IReportColumn } from '../../../services/report.service';
import { GetFunnelStageDetailsActivity } from '../activities/get-stage-details.activity';
import { FunnelStageDetailsResponse } from '../funnels.types';
import { CurrentUser } from '../../../domain/app/current-user';

@injectable()
@query({
    name: 'funnelStageDetails',
    activity: GetFunnelStageDetailsActivity,
    parameters: [
        { name: 'funnelId', type: String!, required: true },
        { name: 'stageId', type: String!, required: true },
    ],
    output: { type: FunnelStageDetailsResponse }
})
export class FunnelStageDetailsQuery implements IQuery<IFunnelStageDetails> {
    constructor(
        @inject(FunnelsService.name) private _funnelsService: FunnelsService,
        @inject(KpiService.name) private _kpiSvc: KpiService,
        @inject(ReportService.name) private _reportService: ReportService,
        @inject(Funnels.name) private _funnels: Funnels,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources,
        @inject(CurrentUser.name) private _currentUser: CurrentUser,
        @inject(Logger.name) private _logger: Logger

    ) { }

    // async run(data: { funnelId: string, stageId: string }): Promise<IFunnelStageDetails> {
    //     try {
    //         const result = await this._funnelsService.getStageDetails(data.funnelId, data.stageId);
    //         return result;
    //     } catch (e) {
    //         this._logger.error(e);
    //         return null;
    //     }
    // }

    async run(data: { funnelId: string, stageId: string }): Promise<IFunnelStageDetails> {
        const { funnelId, stageId } = data;
        try {
            const funnel = await this._funnels.model.findOne({ _id: funnelId }).lean() as IFunnel;
            if (!funnel) throw new Error('funnel not found');

            const foundStage = funnel.stages.find(s => s._id === stageId);
            if (!foundStage) throw new Error('stage not found in funnel');

            const kpi = await this._kpis.model.findOne({ _id: foundStage.kpi }).lean() as IKPIDocument;
            if (!foundStage) throw new Error('kpi not found');

            if (kpi.type !== KPITypeEnum.Simple) { throw new Error('funnel v1 support only simple kpis'); }

            const kpiParts = this._kpiSvc.decomposeKpi(kpi);

            const vs = await this._virtualSources.model.findOne({
                name: { $regex: new RegExp(`^${kpiParts.dataSource}$`, 'i')}
            }).lean() as IVirtualSourceDocument;

            const selectedFields = this._getFieldsToProject(vs, foundStage.fieldsToProject, kpiParts.aggField);

            const report = await this._reportService.runReport({
                dataSource: kpiParts.dataSource,
                dateRange: foundStage.dateRange,
                timezone: this._currentUser.get().profile.timezone,
                filter: kpiParts.filters,
                fields: selectedFields
            });

            report.columns = this._moveAmountColumnToEnd(report.columns, kpiParts.aggField);

            // add a row with the total of the expression field
            const totalRow = this._generateTotalRow(report.columns, report.rows, kpiParts.aggField, selectedFields);
            report.rows.push(totalRow);

            return report;
        } catch (e) {
            this._logger.error(e);
            return null;
        }
    }

    private _getFieldsToProject(vs: IVirtualSourceDocument, selectedFields: string[], kpiField): string[] {
        const fields = [];

        const sortedFields = Object.keys(vs.fieldsMap).sort();

        for (let i = 0; i < sortedFields.length; i++) {
            const fieldElement = vs.fieldsMap[sortedFields[i]];

            if (!selectedFields.some(path => path === fieldElement.path) || fieldElement.path === kpiField) { continue; }

            fields.push(fieldElement.path);
        }

        fields.push(kpiField);

        return fields;
    }

    private _generateTotalRow(columns: IReportColumn[], rows: any[], totalField: string, fields: string[], ): any {
        const total = sumBy(rows, totalField);
        const lastColumn = columns[columns.length - 2];

        let totalRow = { };

        for (let i = 0; i < fields.length; i++) {
            totalRow[fields[0]] = '';
        }

        set(totalRow, lastColumn.path, 'TOTAL');
        set(totalRow, totalField, total);

        return totalRow;
    }

    private _moveAmountColumnToEnd(columns: IReportColumn[], amountField: string): IReportColumn[] {
        return [
            ...columns.filter(c => c.path !== amountField),
            ...columns.filter(c => c.path === amountField)
        ];
    }
}

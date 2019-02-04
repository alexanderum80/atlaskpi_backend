import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FunnelStageKpiFieldType } from '../funnels.types';
import { Funnels } from '../../../domain/app/funnels/funnel.model';
import { GetFunnelStageFieldsActivity } from '../activities/get-funnel-stage-fields.activity';
import * as Bluebird from 'bluebird';
import { KpiService } from '../../../services/kpi.service';

@injectable()
@query({
    name: 'funnelStageFields',
    activity: GetFunnelStageFieldsActivity,
    parameters: [ { name: 'kpis', type: String, required: true, isArray: true }],
    output: { type: FunnelStageKpiFieldType, isArray: true }
})
export class FunnelStageFieldsQuery implements IQuery<FunnelStageKpiFieldType[]> {
    constructor(
        @inject(KpiService.name) private _kpiSvc: KpiService
    ) { }

    async run(data: { kpis: string[] }): Promise<FunnelStageKpiFieldType[]> {
        return await Bluebird.map(data.kpis,
                                  async(k) =>
                                    this._kpiSvc.getKpiFieldsForFunnelStage(k));
    }
}

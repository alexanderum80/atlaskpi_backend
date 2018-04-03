import * as console from 'console';
import { inject, injectable } from 'inversify';

import { IKPIDocument } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetKpiActivity } from '../activities/get-kpi.activity';
import { KPI } from '../kpis.types';
import { KPIExpressionHelper } from '../../../domain/app/kpis/kpi-expression.helper';
import { KpiService } from '../../../services/kpi.service';

@injectable()
@query({
    name: 'kpi',
    activity: GetKpiActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: KPI }
})
export class KpiQuery implements IQuery<IKPIDocument> {

    constructor(@inject(KpiService.name) private _kpisSvc: KpiService) { }

    async run(data: { id: string }): Promise<IKPIDocument> {
        return await this._kpisSvc.getKpi(data.id);
    }
}

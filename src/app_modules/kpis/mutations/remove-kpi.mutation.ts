import { KpiService } from '../../../services/kpi.service';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { RemoveKPIActivity } from '../activities/remove-kpi.activity';
import { KPIRemoveResponse } from '../kpis.types';
import { KpisQuery } from '../queries/kpis.query';
import { DashboardQuery } from '../../dashboards/queries/dashboard.query';
import { ChartsQuery } from '../../charts/queries/charts.query';
import { WidgetQuery } from '../../widgets/queries/widget.query';

@injectable()
@mutation({
    name: 'removeKPI',
    activity: RemoveKPIActivity,
    invalidateCacheFor: [ KpisQuery, DashboardQuery, ChartsQuery, WidgetQuery ],
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: KPIRemoveResponse }
})
export class RemoveKpiMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(KpiService.name) private _kpiService: KpiService
    ) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._kpiService.removeKpi(data.id).then(result => {
                resolve({ success: true, entity: result.entity });
                return;
            }).catch(err => {
                resolve({ success: false, entity: err.entity, errors: [ { field: 'kpi', errors: [ err.error ] }]});
                return;
            });
        });
    }
}

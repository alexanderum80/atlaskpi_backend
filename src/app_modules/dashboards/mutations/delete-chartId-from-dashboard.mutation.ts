import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { deleteChartIdFromDashboardActivity  } from '../activities/delete-chartId-from-dashboard-activity';
import { DashboardInput, DashboardResponse } from '../dashboards.types';
import { DashboardQuery } from '../queries/dashboard.query';


@injectable()
@mutation({
    name: 'deleteChartIdFromDashboard',
    activity: deleteChartIdFromDashboardActivity,
    invalidateCacheFor: [ DashboardQuery ],
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'charts', type: String, isArray: true },
    ],
    output: { type: DashboardResponse }
})
export class DeleteChartIdFromDashboardMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Dashboards.name) private _dashboards: Dashboards) {
        super();
    }

    run(data: { id: string, charts: string[] }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._dashboards.model.deleteChartIdFromDashboard(data.id, data.charts).then(dashboard => {

                resolve({
                    success: true,
                    entity: dashboard
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error updating the dashboard']
                        }
                    ]
                });
            });
        });
    }
}

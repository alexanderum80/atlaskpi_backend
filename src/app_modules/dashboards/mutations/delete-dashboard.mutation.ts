import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteDashboardActivity } from '../activities/delete-dashboard.activity';
import { DashboardResponse } from '../dashboards.types';


@injectable()
@mutation({
    name: 'deleteDashboard',
    activity: DeleteDashboardActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: DashboardResponse }
})
export class DeleteDashboardMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Dashboards') private _dashboards: Dashboards) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;

            // resolve kpis
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._dashboards.model.deleteDashboard(data.id)
            .then(dashboard => {
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
                                errors: ['There was an error deleting the dashboard']
                            }
                        ]
                    });
            });
        });
    }
}

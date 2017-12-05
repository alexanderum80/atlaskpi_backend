
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Dashboards } from '../../../domain';
import { DashboardResponse, DashboardInput } from '../dashboards.types';
import { UpdateDashboardActivity } from '../activities';

@injectable()
@mutation({
    name: 'updateDashboard',
    activity: UpdateDashboardActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: DashboardInput, required: true },
    ],
    output: { type: DashboardResponse }
})
export class UpdateDashboardMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Dashboards') private _dashboards: Dashboards) {
        super();
    }

    run(data: { id: string, input: DashboardInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._dashboards.model.updateDashboard(data.id, data.input).then(dashboard => {
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

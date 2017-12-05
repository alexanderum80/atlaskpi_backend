
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Dashboards } from '../../../domain';
import { DashboardResponse, DashboardInput } from '../dashboards.types';
import { CreateDashboardActivity } from '../activities';

@injectable()
@mutation({
    name: 'createDashboard',
    activity: CreateDashboardActivity,
    parameters: [
        { name: 'input', type: DashboardInput, required: true },
    ],
    output: { type: DashboardResponse }
})
export class CreateDashboardMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Dashboards') private _dashboards: Dashboards) {
        super();
    }

    run(data: { input: DashboardInput,  }): Promise<IMutationResponse> {
        const that = this;

        // resolve kpis
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._dashboards.model.createDashboard(data.input)
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
                                errors: ['There was an error creating the dashboard']
                            }
                        ]
                    });
            });
        });
    }
}

import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateDashboardActivity } from '../activities/create-dashboard.activity';
import { DashboardInput, DashboardResponse } from '../dashboards.types';

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

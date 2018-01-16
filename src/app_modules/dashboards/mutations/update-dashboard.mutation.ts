import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateDashboardActivity } from '../activities/update-dashboard.activity';
import { DashboardInput, DashboardResponse } from '../dashboards.types';


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
    constructor(@inject(Dashboards.name) private _dashboards: Dashboards) {
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
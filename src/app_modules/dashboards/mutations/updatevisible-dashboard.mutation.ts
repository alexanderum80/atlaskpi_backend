import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateVisibleDashboardActivity } from '../activities/updatevisible-dashboard.activity';
import { DashboardInput, DashboardResponse } from '../dashboards.types';


@injectable()
@mutation({
    name: 'updatevisibleDashboard',
    activity: UpdateVisibleDashboardActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: Boolean, required: true },
    ],
    output: { type: DashboardResponse }
})
export class UpdateVisibleDashboardMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Dashboards.name) private _dashboards: Dashboards) {
        super();
    }

    run(data: { id: string, input: Boolean }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._dashboards.model.updateVisibleDashboard(data.id, data.input).then(dashboard => {
                resolve({
                    success: true
                });
            }).catch(err => {
                resolve({
                    success: false
                });
            });
        });
    }
}

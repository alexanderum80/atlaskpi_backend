import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { detachUserFromAllDashboards } from './common';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { AddUserDashboardActivity } from './../activities/adduser-dashboard.activity';
import { Users } from '../../../domain/app/security/users/user.model';


@injectable()
@mutation({
    name: 'adduserDashboard',
    activity: AddUserDashboardActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: String, required: true }
    ],
    output: { type: Boolean }
})
export class AddUserDashboardMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Dashboards.name) private _dashboards: Dashboards,
                @inject(Users.name) private _users: Users) {
        super();
    }

    run(data: { id: string, input: string}): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            const userDetails = data.input.split('|');
            const firstname = userDetails[0];
            const lastname = userDetails[1];
            that._users.model.findByFullName(firstname, lastname)
            .then(user => {
                detachUserFromAllDashboards(that._dashboards.model, user._id)
                .then(() => {
                    that._dashboards.model.adduserDashboard(data.id, user.id).then(dashboard => {
                        resolve({
                            success: true
                        });
                    }).catch(err => {
                        resolve({
                            success: false
                        });
                    });
                })
                .catch(err => reject(err));
            });
        });
    }
}

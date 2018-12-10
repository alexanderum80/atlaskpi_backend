import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { detachUserFromAllDashboards } from './common';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { AddUserDashboardActivity } from './../activities/adduser-dashboard.activity';
import { Users } from '../../../domain/app/security/users/user.model';
import { DashboardResponse } from '../dashboards.types';


@injectable()
@mutation({
    name: 'adduserDashboard',
    activity: AddUserDashboardActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'userId', type: String },
        { name: 'username', type: String, required: true }
    ],
    output: { type: DashboardResponse }
})
export class AddUserDashboardMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Dashboards.name) private _dashboards: Dashboards,
                @inject(Users.name) private _users: Users) {
        super();
    }

    run(data: { id: string, userId: string, username: string}): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            const userId = data.userId;
            const username = data.username;
            
            if(userId) {
                detachUserFromAllDashboards(that._dashboards.model, userId)
                .then(() => {
                    that._dashboards.model.adduserDashboard(data.id, userId).then(dashboard => {
                        resolve({
                            success: true
                        });
                    }).catch(err => {
                        reject({
                            success: false,
                            errors: err
                        });
                    });
                });
            }
        else{
            that._users.model.findByEmail(username)
                .then( user => {
                    detachUserFromAllDashboards(that._dashboards.model, user.id)
                    .then(() => {
                        that._dashboards.model.adduserDashboard(data.id, user.id).then(dashboard => {
                            resolve({
                                success: true
                            });
                        }).catch(err => {
                            reject({
                                success: false,
                                errors: err
                            });
                        });
                    });
                })
                .catch( err => {
                    console.log(err);
                    reject({
                        success: false,
                        errors: err
                    });
                })
        }
        
    });
}
}

import { IDashboard } from '../../../domain/app/dashboards';
import { Winston } from 'winston';
import { IUserDocument } from '../../../domain/app/security/users';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Dashboards } from '../../../domain';
import { Dashboard } from '../dashboards.types';
import { GetDashboardsActivity } from '../activities';

@injectable()
@query({
    name: 'dashboards',
    activity: GetDashboardsActivity,
    parameters: [
        { name: 'group', type: String },
    ],
    output: { type: Dashboard, isArray: true }
})
export class DashboardsQuery extends QueryBase<IDashboard[]> {
    constructor(
        @inject('Dashboards') private _dashboards: Dashboards,
        @inject('logger') private _logger: Winston,
        @inject('CurrentUser') private _currentUser: IUserDocument
    ) {
        super();
    }

    run(data: { group: String,  }): Promise<IDashboard[]> {
        const that = this;

        if (!this._currentUser) {
            this._logger.error('No user logged in at this point, so not dashboards can be generated');
            return Promise.resolve([]);
        }

        // lets prepare the query for the dashboards
        let query = {};
        if (this._currentUser.roles.find(r => r.name === 'owner')) {
            query = {};
        } else {
            query = { $or: [ { owner: that._currentUser._id }, { users: { $in: [that._currentUser._id]} } ]};
        }

        return new Promise<IDashboard[]>((resolve, reject) => {
            that._dashboards.model
                .find(query)
                .populate({
                    path: 'charts',
                    populate: { path: 'kpis' }
                })
                .populate({
                    path: 'owner',
                    select: ['_id', 'username']
                })
                .then(dashboards => {
                    resolve(dashboards);
                }).catch(e => {
                    reject(e);
                });
        });
    }
}

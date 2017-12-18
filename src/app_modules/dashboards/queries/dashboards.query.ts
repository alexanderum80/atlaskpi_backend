import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isArray } from 'util';

import { Charts } from '../../../domain/app/charts/chart.model';
import { IDashboard } from '../../../domain/app/dashboards/dashboard';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetDashboardsActivity } from '../activities/get-dashboards.activity';
import { Dashboard } from '../dashboards.types';
import { Logger } from '../../../domain/app/logger';
import { CurrentUser } from '../../../domain/app/current-user';


@injectable()
@query({
    name: 'dashboards',
    activity: GetDashboardsActivity,
    parameters: [
        { name: 'group', type: String },
    ],
    output: { type: Dashboard, isArray: true }
})
export class DashboardsQuery implements IQuery<IDashboard[]> {
    constructor(
        @inject(Dashboards.name) private _dashboards: Dashboards,
        @inject(Charts.name) private _charts: Charts,
        @inject(KPIs.name) private kpis: KPIs,
        @inject('Logger') private _logger: Logger,
        @inject(CurrentUser.name) private _currentUser: CurrentUser
    ) { }

    run(data: { group: string,  }): Promise<IDashboard[]> {
        const that = this;

        if (!this._currentUser) {
            this._logger.error('No user logged in at this point, so not dashboards can be generated');
            return Promise.resolve([]);
        }

        // lets prepare the query for the dashboards
        let query = {};
        if (this._currentUser.get().roles.find(r => r.name === 'owner')) {
            query = {};
        } else {
            query = { $or: [ { owner: that._currentUser.get()._id }, { users: { $in: [that._currentUser.get()._id]} } ]};
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

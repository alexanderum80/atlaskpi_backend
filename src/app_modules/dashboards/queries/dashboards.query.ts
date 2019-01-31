import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isArray } from 'util';

import { Charts } from '../../../domain/app/charts/chart.model';
import { IDashboard } from '../../../domain/app/dashboards/dashboard';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { Logger } from '../../../domain/app/logger';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetDashboardsActivity } from '../activities/get-dashboards.activity';
import { Dashboard } from '../dashboards.types';
import { CurrentUser } from './../../../domain/app/current-user';
import * as Bluebird from 'bluebird';

const transformProps = require('transform-props');


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
        @inject('CurrentUser') private _currentUser: CurrentUser
    ) { }

    run(data: { group: string  }): Promise<IDashboard[]> {
        const that = this;

        if (!this._currentUser || !this._currentUser.get()) {
            this._logger.error('No user logged in at this point, so not dashboards can be generated');
            return Promise.resolve([]);
        }

        // lets prepare the query for the dashboards
        let query = {};

        if (this._currentUser.get().roles.find(r => r.name === 'owner')) {
            query = {};
        } else {
            query = { $or: [
                { owner: that._currentUser.get()._id },
                { users: { $in: [that._currentUser.get()._id]} }
            ]};
        }

        return new Promise<IDashboard[]>((resolve, reject) => {
            that._dashboards.model
                .find(query)
                .lean(true)
                .populate({
                    path: 'charts',
                    populate: { path: 'kpis.kpi' }
                })
                .populate({
                    path: 'owner',
                    select: ['_id', 'username', 'profile.firstName', 'profile.lastName', 'visible']
                })
                .populate({path: 'updatedBy', model: 'User'})
                .then(dashboards => {
                    (dashboards as IDashboard[]).forEach(d => {
                        let updatedBy = "";
                        
                        if(d.updatedBy !== null){
                            const firstNameUpdated = d.updatedBy.profile.firstName;
                            const lastNameUpdated = d.updatedBy.profile.lastName;
                            updatedBy = (firstNameUpdated ? firstNameUpdated + ' ' : '') + (lastNameUpdated ? lastNameUpdated + ' ' : '');
                        }
                        
                        d.updatedBy = updatedBy;
                        transformProps(d, this.castToString, '_id');
                        d.owner = JSON.stringify(d.owner) as any;
                        d.charts = d.charts.map(c => JSON.stringify(c)) as any;
                    });


                    resolve(dashboards as IDashboard[]);
                }).catch(e => {
                    reject(e);
                });
        });
    }

    castToString(arg) {
        return String(arg);
    }
}

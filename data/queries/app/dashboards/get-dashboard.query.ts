import { QueryBase } from '../../query-base';
import { GetChartQuery } from '../charts';
import { ChartFactory } from '../charts/charts/chart-factory';
import { FrequencyTable } from '../../../models/common/frequency-enum';
import { FrequencyEnum, IDateRange } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IDashboard, IDashboardModel } from '../../../models';
import { IUserDocument } from '../../../models/app/users/IUser';
import * as logger from 'winston';

export class GetDashboardQuery extends QueryBase<IDashboard> {

    constructor(public identity: IIdentity, private _ctx: IAppModels, private _user: IUserDocument) {
        super(identity);
    }

    // log = true;
    // audit = true;

    run(data: { id: string }): Promise<IDashboard> {
        let that = this;

        // lets prepare the query for the dashboards
        let query = { };
        if (this._user.roles.find(r => r.name === 'owner')) {
            query = { _id: data.id };
        } else {
            query = { _id: data.id, $or: [ { owner: that._user._id }, { users: { $in: [that._user._id]} } ]};
        }

        return new Promise<IDashboard>((resolve, reject) => {
            that._ctx.Dashboard
                .findOne(query)
                .populate({
                    path: 'charts',
                    populate: { path: 'kpis' }
                })
                .then(dashboard => {

                    if (!dashboard) {
                        logger.debug('dashbord doenst exists, or not enought permissions to see it.');
                        reject('not found');
                        return;
                    }

                    // process charts
                    let promises = dashboard.charts.map(c => {
                        let chartQuery = new GetChartQuery(that.identity, that._ctx, that._user);
                        return chartQuery.run({ id: (<any>c)._id });
                    });

                    Promise.all(promises).then((charts) => {
                        let response = {};
                        Object.assign(response, dashboard.toObject(), { charts: charts });
                        resolve(<any>response);
                    }).catch(e => reject(e));
                });
        });
    }
}

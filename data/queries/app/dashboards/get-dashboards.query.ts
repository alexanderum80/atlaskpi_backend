import { IUserDocument } from '../../../models/app/users/IUser';
import { QueryBase } from '../../query-base';
import { FrequencyTable } from '../../../models/common/frequency-enum';
import { FrequencyEnum, IDateRange } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IDashboard, IDashboardModel } from '../../../models';
import * as _ from 'lodash';

export class GetDashboardsQuery extends QueryBase<IDashboard[]> {

    constructor(public identity: IIdentity, private _ctx: IAppModels, private _user: IUserDocument) {
        super(identity);
    }

    // log = true;
    // audit = true;

    run(data: { id: string, dateRange: { from: string, to: string}, frequency: string }): Promise<IDashboard[]> {
        const that = this;

        // lets prepare the query for the dashboards
        let query = {};
        if (this._user.roles.find(r => r.name === 'owner')) {
            query = {};
        } else {
            query = { $or: [ { owner: that._user._id }, { users: { $in: [that._user._id]} } ]};
        }

        return new Promise<IDashboard[]>((resolve, reject) => {
            that._ctx.Dashboard
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

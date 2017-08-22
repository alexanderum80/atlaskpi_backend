import { QueryBase } from '../../query-base';
import { FrequencyTable } from '../../../models/common/frequency-enum';
import { FrequencyEnum, IDateRange } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IDashboard, IDashboardModel } from '../../../models';

export class GetDashboardsQuery extends QueryBase<IDashboard[]> {

    constructor(public identity: IIdentity, private _ctx: IAppModels) {
        super(identity);
    }

    // log = true;
    // audit = true;

    run(data: { id: string, dateRange: { from: string, to: string}, frequency: string }): Promise<IDashboard[]> {
        let that = this;

        return new Promise<IDashboard[]>((resolve, reject) => {
            that._ctx.Dashboard
                .find({})
                .populate({
                    path: 'charts',
                    populate: { path: 'kpis' }
                })
                .then(dashboards => {
                    resolve(dashboards);
                }).catch(e => {
                    reject(e);
                });
        });
    }
}

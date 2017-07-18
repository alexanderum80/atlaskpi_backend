import { FrequencyTable } from '../../../models/common/frequency-enum';
import { FrequencyEnum, IDateRange } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import { Chart } from '../charts/charts/chart';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IDashboard, IDashboardModel } from '../../../models';

export class GetDashboardsQuery implements IQuery<IDashboard[]> {

    constructor(public identity: IIdentity, private _ctx: IAppModels) { }

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

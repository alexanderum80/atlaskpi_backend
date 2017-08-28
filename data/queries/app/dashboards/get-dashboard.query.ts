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

export class GetDashboardQuery extends QueryBase<IDashboard> {

    constructor(public identity: IIdentity, private _ctx: IAppModels) {
        super(identity);
    }

    // log = true;
    // audit = true;

    run(data: { id: string }): Promise<IDashboard> {
        let that = this;

        return new Promise<IDashboard>((resolve, reject) => {
            that._ctx.Dashboard
                .findOne({ _id: data.id })
                .populate({
                    path: 'charts',
                    populate: { path: 'kpis' }
                })
                .then(dashboard => {
                    // process charts
                    let promises = dashboard.charts.map(c => {
                        let chartQuery = new GetChartQuery(that.identity, that._ctx);
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

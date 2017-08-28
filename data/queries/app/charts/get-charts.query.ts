import { QueryBase } from '../../query-base';
import { GetChartQuery } from './get-chart.query';
import { IAppModels } from '../../../models/app/app-models';
import { IKPIModel, IKPI } from '../../../models/app/kpis';
import { IChart } from '../../../models/app/charts';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserModel, IPaginationDetails, IPagedQueryResult } from '../../../';
export class GetChartsQuery extends QueryBase<IChart[]> {

    constructor(
        public identity: IIdentity,
        private _ctx: IAppModels) {
            super(identity);
        }

    run(data: { preview: boolean }): Promise<IChart[]> {
        const that = this;

        return new Promise<IChart[]>((resolve, reject) => {
            that._ctx.Chart
            .find({})
            .populate({
                path: 'kpis'
            })
            .then(chartsCollection => {
                // process charts
                let promises = chartsCollection.map(c => {
                    let chartQuery = new GetChartQuery(that.identity, that._ctx);
                    return chartQuery.run({ id: c._id });
                });

               Promise.all(promises).then((charts) => {
                let response = {};
                Object.assign(response, { charts: charts });
                resolve(<any>JSON.stringify(response));
               }).catch(e => reject(e));
            });

        });
    }
}


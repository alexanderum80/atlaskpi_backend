import { IGraphqlContext } from '../../../graphql';
import { QueryBase } from '../../query-base';
import { GetChartQuery } from './get-chart.query';
import { IAppModels } from '../../../models/app/app-models';
import { IKPIModel, IKPI } from '../../../models/app/kpis';
import { IChart, IGetChartInput } from '../../../models/app/charts';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserModel, IPaginationDetails, IPagedQueryResult } from '../../../';
export class PreviewChartsQuery extends QueryBase<string> {

    constructor(
        public identity: IIdentity,
        private _ctx: IGraphqlContext) {
            super(identity);
        }

    run(data: { chart?: IChart, id?: string, input?: any }): Promise<string> {
        const that = this;
        let query = new GetChartQuery(this.identity, this._ctx.req.appContext);

        return new Promise<string>((resolve, reject) => {
            return that._ctx.req.appContext.KPI.findOne({ _id: data.input.kpis[0]})
            .then(kpi => {
                // GetChartQuery is expecting a the input parameter as chart
                data.chart = data.input;
                data.chart.chartDefinition = JSON.parse(data.input.chartDefinition);
                data.chart.kpis[0] = kpi;
                return that._ctx.queryBus.run('get-chart', query, data, that._ctx.req);
            });
        });
    }
}


import { KPIs } from '../../../domain/app/kpis';
import { ChartQuery } from './chart.query.new';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Charts } from '../../../domain';
import { ChartAttributesInput } from '../charts.types';
import { PreviewChartActivity } from '../activities';

@injectable()
@query({
    name: 'previewChart',
    activity: PreviewChartActivity,
    parameters: [
        { name: 'input', type: ChartAttributesInput },
    ],
    output: { type: String }
})
export class PreviewChartQuery extends QueryBase<String> {
    constructor(
        @inject('Charts') private _charts: Charts,
        @inject('KPIs') private _kpis: KPIs,
        @inject('GetChartQuery') private _getChartQuery: ChartQuery) {
        super();
    }

    run(data: { input: ChartAttributesInput, chart: any }): Promise<String> {
        const that = this;

        return new Promise<string>((resolve, reject) => {
            return that._kpis.model.findOne({ _id: data.input.kpis[0]})
            .then(kpi => {
                // GetChartQuery is expecting a the input parameter as chart
                data.chart = data.input;
                data.chart.chartDefinition = JSON.parse(data.input.chartDefinition);
                data.chart.kpis[0] = kpi;
                return that._getChartQuery.run(data as any)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }
}

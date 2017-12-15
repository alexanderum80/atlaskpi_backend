import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Charts } from '../../../domain/app/charts/chart.model';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { input } from '../../../framework/decorators/input.decorator';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { PreviewChartActivity } from '../activities/preview-chart.activity';
import { ChartAttributesInput } from '../charts.types';
import { ChartQuery } from './chart.query';


@injectable()
@query({
    name: 'previewChart',
    activity: PreviewChartActivity,
    parameters: [
        { name: 'input', type: ChartAttributesInput },
    ],
    output: { type: String }
})
export class PreviewChartQuery implements IQuery<String> {
    constructor(
        @inject('Charts') private _charts: Charts,
        @inject('KPIs') private _kpis: KPIs,
        @inject('GetChartQuery') private _getChartQuery: ChartQuery) { }

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

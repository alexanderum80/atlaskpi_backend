import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IChartInput } from '../../../domain/app/charts/chart';
import { query } from '../../../framework/decorators/query.decorator';
import { ChartsService } from '../../../services/charts.service';
import { GetChartActivity } from '../activities/get-chart.activity';
import { GetChartInput } from '../charts.types';
import { Logger } from './../../../../di';
import { IChart } from './../../../domain/app/charts/chart';
import { IQuery } from './../../../framework/queries/query';

// TODO: I need kind of a big refactory here
@injectable()
@query({
    name: 'chart',
    activity: GetChartActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'input', type: GetChartInput },
    ],
    output: { type: String }
})
export class ChartQuery implements IQuery<String> {
    constructor(
        @inject(ChartsService.name) private _chartsService: ChartsService,
        @inject('Logger') private _logger: Logger
    ) { }

    run(data: { id: string, input: IChartInput, /* TODO: I added this extra parameter here maually */ chart: any }): Promise<String> {
        this._logger.debug('running get chart query for id:' + data.id);


        // in order for this query to make sense I need either a chart definition or an id
        if (!data.chart && !data.id && !data.input) {
            return Promise.reject('An id or a chart definition is needed');
        }

        let chartPromise = data.chart ?
                Promise.resolve(<IChart>data.chart)
                : this._chartsService.getChartById(data.id);

        const that = this;
        return new Promise<string>((resolve, reject) => {
            chartPromise.then(chart => {
                that._chartsService.renderDefinition(chart, data.input).then(definition => {
                    chart.chartDefinition = definition;
                    resolve(JSON.stringify(chart));
                });
            })
            .catch(err => {
                that._logger.error(err);
                reject(err);
            });
        });
    }
}

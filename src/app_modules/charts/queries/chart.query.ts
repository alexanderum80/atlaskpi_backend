import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';

import { IChartInput } from '../../../domain/app/charts/chart';
import { query } from '../../../framework/decorators/query.decorator';
import { ChartsService } from '../../../services/charts.service';
import { GetChartActivity } from '../activities/get-chart.activity';
import { GetChartInput } from '../charts.types';
import { IChart } from './../../../domain/app/charts/chart';
import { IQuery } from './../../../framework/queries/query';
import { Logger } from '../../../domain/app/logger';
import { Int32 } from 'bson';

// TODO: I need kind of a big refactory here
@injectable()
@query({
    name: 'chart',
    cache: { ttl: 1800 },
    activity: GetChartActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'input', type: GetChartInput },
        {name: 'position', type: String},
    ],
    output: { type: String }
})
export class ChartQuery implements IQuery<String> {
    constructor(
        @inject(ChartsService.name) private _chartsService: ChartsService,
        @inject('Logger') private _logger: Logger
    ) { }

    run(data: { id: string, input: IChartInput, position: string, /* TODO: I added this extra parameter here maually */ chart: any }): Promise<String> {
        this._logger.debug('running get chart query for id:' + data.id);

        const that = this;
        return new Promise<string>((resolve, reject) => {
            let chartPromise: Promise<IChart> =  data.chart !== undefined ?
                that._chartsService.getChart(data.chart) :
                that._chartsService.getChart(data.id.toString(), data.input);

            chartPromise.then((res) => {
                if (data.position) { res['position'] = data.position; }
                resolve(JSON.stringify(res));
                return;
            })
            .catch(err => {
                that._logger.error(err);
                reject(err);
            });
        });
    }
}

import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IChartInput } from '../../../domain/app/charts/chart';
import { query } from '../../../framework/decorators/query.decorator';
import { ChartsService } from '../../../services/charts.service';
import { GetChartActivity } from '../activities/get-chart.activity';
import { GetChartInput } from '../charts.types';
import { IChart } from './../../../domain/app/charts/chart';
import { IQuery } from './../../../framework/queries/query';
import { Logger } from '../../../domain/app/logger';

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
        @inject(Logger.name) private _logger: Logger
    ) { }

    run(data: { id: string, input: IChartInput, /* TODO: I added this extra parameter here maually */ chart: any }): Promise<String> {
        this._logger.debug('running get chart query for id:' + data.id);

        const that = this;
        return new Promise<string>((resolve, reject) => {
            that._chartsService
                .getChart(data.id, data.input, data.chart)
                .then((res) => {
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

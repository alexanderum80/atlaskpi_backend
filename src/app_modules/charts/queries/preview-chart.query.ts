import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { Winston } from 'winston';

import { IQuery, query } from '../../../framework';
import { PreviewChartActivity } from '../activities';
import { ChartAttributesInput } from '../charts.types';
import { ChartsService } from './../../../services/charts.service';

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
        @inject(ChartsService.name) private _chartsService: ChartsService,
        @inject('logger') private _logger: Winston
    ) { }

    run(data: { input: ChartAttributesInput }): Promise<String> {
        const that = this;

        return new Promise<string>((resolve, reject) => {
            that._chartsService.previewChart(data.input)
                .then(chart => {
                    resolve(JSON.stringify(chart));
                    return;
                })
                .catch(err => {
                    that._logger.error(err);
                    reject(err);
                });
        });
    }
}

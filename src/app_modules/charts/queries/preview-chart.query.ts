import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { Winston } from 'winston';

import { input } from '../../../framework/decorators/input.decorator';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { PreviewChartActivity } from '../activities/preview-chart.activity';
import { Logger } from './../../../../di';
import { ChartsService } from './../../../services/charts.service';
import { ChartAttributesInput } from './../charts.types';

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
        @inject(Logger.name) private _logger: Winston
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

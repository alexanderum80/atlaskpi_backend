import { inject, injectable } from 'inversify';

import { input } from '../../../framework/decorators/input.decorator';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { PreviewChartActivity } from '../activities/preview-chart.activity';
import { Logger } from './../../../domain/app/logger';
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
        @inject(Logger.name) private _logger: Logger
    ) { }

    async run(data: { input: ChartAttributesInput }): Promise<String> {
        try {
            const chart = await this._chartsService.previewChart(data.input);
            return JSON.stringify(chart);
        } catch (e) {
            this._logger.error(e);
            return '';
        }
    }
}

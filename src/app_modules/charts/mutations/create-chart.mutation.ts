import { inject, injectable } from 'inversify';

import { IChartInput } from '../../../domain/app/charts/chart';
import { Logger } from '../../../domain/app/logger';
import { input } from '../../../framework/decorators/input.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { ChartsService } from '../../../services/charts.service';
import { CreateChartActivity } from '../activities/create-chart.activity';
import { ChartAttributesInput, ChartMutationResponse } from '../charts.types';

@injectable()
@mutation({
    name: 'createChart',
    activity: CreateChartActivity,
    parameters: [
        { name: 'input', type: ChartAttributesInput },
    ],
    output: { type: ChartMutationResponse }
})
export class CreateChartMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ChartsService.name) private _chartsService: ChartsService,
        @inject('Logger') private _logger: Logger
    ) {
        super();
    }

    async run(data: { input: IChartInput }): Promise<IMutationResponse> {
        try {
            const chart = await this._chartsService.createChart(data.input);
            return { success: true, entity: chart};
        } catch (e) {
            this._logger.error(e);
            return { success: false, errors: [ e ] };
        }
    }
}


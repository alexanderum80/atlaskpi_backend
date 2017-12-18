import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IChartInput } from '../../../domain/app/charts/chart';
import { field } from '../../../framework/decorators/field.decorator';
import { input } from '../../../framework/decorators/input.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateChartActivity } from '../activities/update-chart.activity';
import { ChartAttributesInput, ChartMutationResponse } from '../charts.types';
import { Logger } from './../../../domain/app/logger';
import { ChartsService } from './../../../services/charts.service';

@injectable()
@mutation({
    name: 'updateChart',
    activity: UpdateChartActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: ChartAttributesInput, required: true },
    ],
    output: { type: ChartMutationResponse }
})
export class UpdateChartMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ChartsService.name) private _chartsService: ChartsService,
        @inject(Logger.name) private _logger: Logger) {
        @inject('Logger') private _logger: Logger
        super();
    }

    run(data: { id: string, input: IChartInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._chartsService
                .updateChart(data.id, data.input)
                .then((chart) => {
                    resolve({ entity: chart, success: true });
                    return;
                })
                .catch(err => {
                    that._logger.error(err);
                    resolve({ success: false, errors: [ { field: 'chart', errors: [err] } ]})
                    return;
                });
        });
    }
}

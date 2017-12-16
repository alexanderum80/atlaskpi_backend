import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IChartInput } from '../../../domain/app/charts/chart';
import { Logger } from '../../../domain/app/logger';
import { field } from '../../../framework/decorators/field.decorator';
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

    run(data: { input: IChartInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            // resolve kpis
            that._chartsService.createChart(data.input).then(chart => {
                resolve({ success: true, entity: chart});
                return;
            })
            .catch(err => resolve({ success: false, errors: [ err ]}));
        });
    }
}


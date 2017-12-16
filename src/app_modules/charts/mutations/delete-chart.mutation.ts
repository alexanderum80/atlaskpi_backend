import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { ChartsService } from '../../../services/charts.service';
import { DeleteChartActivity } from '../activities/delete-chart.activity';
import { ChartMutationResponse } from '../charts.types';
import { Logger } from './../../../domain/app/logger';

@injectable()
@mutation({
    name: 'deleteChart',
    activity: DeleteChartActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: ChartMutationResponse }
})
export class DeleteChartMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ChartsService.name) private _chartsService: ChartsService,
        @inject(Logger.name) private _logger: Logger) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._chartsService
                .deleteChart(data.id)
                .then(chart => {
                    resolve({ success: true, entity: chart });
                    return;
                })
                .catch(err => {
                    resolve({ success: false, errors: [ { field: 'id', errors: [err]} ] });
                    return;
                });
        });
    }
}

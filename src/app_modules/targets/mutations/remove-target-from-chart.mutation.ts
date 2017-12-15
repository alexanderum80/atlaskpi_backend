import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Targets } from '../../../domain/app/targets/target.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { RemoveTargetFromChartActivity } from '../activities/remove-target-from-chart.activity';
import { TargetRemoveResult } from '../targets.types';

@injectable()
@mutation({
    name: 'removeTargetFromChart',
    activity: RemoveTargetFromChartActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: TargetRemoveResult }
})
export class RemoveTargetFromChartMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Targets') private _targets: Targets) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._targets.model.removeTargetFromChart(data.id)
                .then((deletedTarget) => {
                    resolve({ success: true, entity: deletedTarget});
                    return;
                }).catch((err) => {
                    resolve({ success: false, errors: [ {field: 'target', errors: [err]} ] });
                    return;
                });
        });
    }
}

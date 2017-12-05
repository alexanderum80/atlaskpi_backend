
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Targets } from '../../../domain';
import { TargetRemoveResult } from '../targets.types';
import { RemoveTargetFromChartActivity } from '../activities';

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

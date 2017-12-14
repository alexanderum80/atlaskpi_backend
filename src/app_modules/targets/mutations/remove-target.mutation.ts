
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Targets } from '../../../domain';
import { TargetRemoveResult } from '../targets.types';
import { RemoveTargetActivity } from '../activities';

@injectable()
@mutation({
    name: 'removeTarget',
    activity: RemoveTargetActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'owner', type: String },
    ],
    output: { type: TargetRemoveResult }
})
export class RemoveTargetMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Targets') private _targets: Targets) {
        super();
    }

    run(data: { id: string, owner: String }): Promise<IMutationResponse> {
        // TODO: Refactor this
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._targets.model.removeTarget(data.id)
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

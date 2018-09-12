import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { RemoveTargetActivity } from '../activities/remove-target.activity';
import { TargetRemoveResult } from '../targets.types';
import { TargetsNew } from '../../../domain/app/targetsNew/target.model';

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
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) {
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

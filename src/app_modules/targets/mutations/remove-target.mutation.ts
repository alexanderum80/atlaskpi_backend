import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Targets } from '../../../domain/app/targets/target.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { RemoveTargetActivity } from '../activities/remove-target.activity';
import { TargetRemoveResult } from '../targets.types';

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
    constructor(@inject(Targets.name) private _targets: Targets) {
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

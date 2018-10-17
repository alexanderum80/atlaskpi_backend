import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { TargetsNew } from '../../../domain/app/targetsNew/target.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteTargetNewActivity } from '../activities/delete-target.activity';
import { DeleteTargetNewResponse } from '../target.types';



@injectable()
@mutation({
    name: 'deleteTargetNew',
    activity: DeleteTargetNewActivity,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: DeleteTargetNewResponse }
})
export class DeleteTargetNewMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) {
        super();
    }

    run(data: { _id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._targets.model.deleteTargetNew(data._id).then(target => {
                resolve({
                    success: target !== null,
                    errors: target !== null ? [] : [{ field: 'general', errors: ['Target not found'] }]
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error deleting the target']
                        }
                    ]
                });
            });
        });
    }
}

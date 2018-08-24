import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { TargetsNew } from '../../../domain/app/targetsNew/target.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateTargetNewActivity } from '../activities/update-target.activity';
import { UpdateTargetNewResponse, TargetNewInput } from '../target.types';
import { ITargetNewInput } from '../../../domain/app/targetsNew/target';

@injectable()
@mutation({
    name: 'updateTargetNew',
    activity: UpdateTargetNewActivity,
    parameters: [
        { name: '_id', type: String, required: true },
        { name: 'TargetInput', type: TargetNewInput }
    ],
    output: { type: UpdateTargetNewResponse }
})
export class UpdateTargetNewMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) {
        super();
    }

    run(data: { _id: string, TargetInput: ITargetNewInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._targets.model.updateTargetNew(data._id, data.TargetInput).then(target => {
                resolve({
                    success: true,
                    entity: target
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error updating the target']
                        }
                    ]
                });
            });
        });
    }
}

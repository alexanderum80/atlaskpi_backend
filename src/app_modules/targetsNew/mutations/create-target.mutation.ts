import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { TargetsNew } from '../../../domain/app/targetsNew/target.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateTargetNewActivity } from '../activities/create-target.activity';
import { CreateTargetNewResponse, TargetNewInput } from '../target.types';
import { ITargetNewInput, ITargetNew } from '../../../domain/app/targetsNew/target';


@injectable()
@mutation({
    name: 'createTargetNew',
    activity: CreateTargetNewActivity,
    parameters: [
        { name: 'TargetInput', type: TargetNewInput },
    ],
    output: { type: CreateTargetNewResponse }
})
export class CreateTargetNewMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) {
        super();
    }

    run(data: { TargetInput: ITargetNewInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._targets.model.createNew(data.TargetInput).then(target => {
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
                            errors: ['There was an error creating the target']
                        }
                    ]
                });
            });
        });
    }
}

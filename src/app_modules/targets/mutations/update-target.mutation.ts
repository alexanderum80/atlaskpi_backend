import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { TargetService } from '../../../services/target.service';
import { UpdateTargetActivity } from '../activities/update-target.activity';
import { TargetInput, TargetResult } from '../targets.types';
import { ITargetNew } from '../../../domain/app/targetsNew/target';

@injectable()
@mutation({
    name: 'updateTarget',
    activity: UpdateTargetActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'data', type: TargetInput },
    ],
    output: { type: TargetResult }
})
export class UpdateTargetMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(TargetService.name) private _targetService: TargetService
    ) {
        super();
    }

    async run(data: { id: string, data: ITargetNew}): Promise<IMutationResponse> {
        const that = this;
        const mutationData = data.data;

        try {
            const targetDoc = await this._targetService.createUpdateTarget(mutationData, data.id);
            return ({
                success: true,
                entity: targetDoc
            });
        } catch (err) {
            return ({
                success: false,
                errors: [ { field: 'target', errors: [err] }]
            });
        }

    }
}

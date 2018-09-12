import { inject, injectable } from 'inversify';

import { Charts } from '../../../domain/app/charts/chart.model';
import { Users } from '../../../domain/app/security/users/user.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { TargetService } from '../../../services/target.service';
import { CreateTargetActivity } from '../activities/create-target.activity';
import { TargetInput, TargetResult } from '../targets.types';
import { ITargetNew } from '../../../domain/app/targetsNew/target';


@injectable()
@mutation({
    name: 'createTarget',
    activity: CreateTargetActivity,
    parameters: [
        { name: 'data', type: TargetInput },
    ],
    output: { type: TargetResult }
})
// TODO: Refactor!!! Refator!!
export class CreateTargetMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Users.name) private _users: Users,
        @inject(Charts.name) private _charts: Charts,
        @inject(TargetService.name) private _targetService: TargetService
    ) {
        super();
    }

    async run(data: { data: ITargetNew }): Promise<IMutationResponse> {
        // TODO: REFACTOR THIS
        const that = this;
        const mutationData = data.data;

        try {
            const targetDoc = await this._targetService.createUpdateTarget(mutationData);

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

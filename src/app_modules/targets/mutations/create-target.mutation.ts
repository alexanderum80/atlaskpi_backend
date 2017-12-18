import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Charts } from '../../../domain/app/charts/chart.model';
import { Users } from '../../../domain/app/security/users/user.model';
import { ITarget } from '../../../domain/app/targets/target';
import { Targets } from '../../../domain/app/targets/target.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { TargetService } from '../../../services/target.service';
import { CreateTargetActivity } from '../activities/create-target.activity';
import { TargetInput, TargetResult } from '../targets.types';


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
        @inject(Targets.name) private _targets: Targets,
        @inject(Users.name) private _users: Users,
        @inject(Charts.name) private _charts: Charts,
        @inject(TargetService.name) private _targetService: TargetService
    ) {
        super();
    }

    run(data: { data: ITarget }): Promise<IMutationResponse> {
        // TODO: REFACTOR THIS
        const that = this;
        let mutationData = data.data;

        return new Promise<IMutationResponse>((resolve, reject) => {
            // TODO: Refactor
            this._targetService.caculateFormat(mutationData)
                .then((dataTarget) => {
                    mutationData.target = dataTarget;

                    that._targets.model.createTarget(mutationData)
                        .then((target) => {
                            resolve({ entity: target, success: true });
                            return;
                        }).catch((err) => {
                            resolve({ success: false, errors: [ {field: 'target', errors: [err]} ] });
                            return;
                        });
                });
        });
    }
}

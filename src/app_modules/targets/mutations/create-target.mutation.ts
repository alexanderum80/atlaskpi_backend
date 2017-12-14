import { ITarget } from '../../../domain/app/targets';
import { Charts } from '../../../domain/app/charts';
import { Users } from '../../../domain/app/security/users';
import { TargetService } from '../../../services/target.service';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Targets } from '../../../domain';
import { IMutationResponse, mutation, MutationBase } from '../../../framework';
import { CreateTargetActivity } from '../activities';
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
export class CreateTargetMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject('Targets') private _targets: Targets,
        @inject('Users') private _users: Users,
        @inject('Charts') private _charts: Charts,
        @inject(TargetService.name) private _targetService: TargetService
    ) {
        super();
    }

    run(data: { data: ITarget }): Promise<IMutationResponse> {
        // TODO: REFACTOR THIS
        const that = this;
        let mutationData = data.hasOwnProperty('data') ? data.data : data;

        // let targetService = new TargetService(this._users.model, this._targets.model, this._charts.model);

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

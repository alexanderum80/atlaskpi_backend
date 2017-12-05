import { TargetService } from '../../../services/target.service';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Targets } from '../../../domain';
import { TargetResult, TargetInput } from '../targets.types';
import { UpdateTargetActivity } from '../activities';

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
        @inject('Targets') private _targets: Targets,
        @inject('TargetService') private _targetService: TargetService
    ) {
        super();
    }

    run(data: { id: string, data: TargetInput,  }): Promise<IMutationResponse> {
        const that = this;
        let mutationData = data.hasOwnProperty('data') ? data.data : data;

        return new Promise<IMutationResponse>((resolve, reject) => {

            // TODO: Refactor!!
            that._targetService.caculateFormat(mutationData, that._ctx)
                .then((dataTarget) => {
                    mutationData.target = dataTarget;
                    that._targets.model.updateTarget(data.id, mutationData)
                        .then((theTarget) => {
                            resolve({ success: true, entity: theTarget });
                            return;
                        }).catch((err) => {
                            resolve({ success: false, errors: [ {field: 'target', errors: [err]} ] });
                            return;
                        });
                });
        });
    }
}

import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Targets } from '../../../domain/app/targets/target.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { TargetService } from '../../../services/target.service';
import { UpdateTargetActivity } from '../activities/update-target.activity';
import { TargetInput, TargetResult } from '../targets.types';

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
        @inject(Targets.name) private _targets: Targets,
        @inject(TargetService.name) private _targetService: TargetService
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

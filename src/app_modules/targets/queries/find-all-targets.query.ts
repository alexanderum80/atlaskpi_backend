import { ITargetDocument } from '../../../domain/app/targets';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Targets } from '../../../domain';
import { TargetResponse } from '../targets.types';
import { FindAllTargetsActivity } from '../activities';

@injectable()
@query({
    name: 'findAllTargets',
    activity: FindAllTargetsActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: TargetResponse }
})
export class FindAllTargetsQuery extends QueryBase<ITargetDocument[]> {
    constructor(@inject('Targets') private _targets: Targets) {
        super();
    }

    run(data: { filter: string,  }): Promise<ITargetDocument[]> {
        const that = this;
        return new Promise<ITargetDocument[]>((resolve, reject) => {
            that._targets.model.findAllTargets()
                .then((target) => {
                    return resolve(target);
                }).catch((err) => {
                    reject({ success: false, errors: [ {field: 'target', errors: [err] } ] });
                    return;
                });
        });
    }
}

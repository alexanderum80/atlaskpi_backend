import { ITargetDocument } from '../../../domain/app/targets';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Targets } from '../../../domain';
import { TargetResponse } from '../targets.types';
import { FindTargetActivity } from '../activities';

@injectable()
@query({
    name: 'findTarget',
    activity: FindTargetActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: TargetResponse }
})
export class FindTargetQuery implements IQuery<ITargetDocument> {
    constructor(@inject('Targets') private _targets: Targets) {
        
    }

    run(data: { id: string }): Promise<ITargetDocument> {
        const that = this;

        return new Promise<ITargetDocument>((resolve, reject) => {
            that._targets.model.findTarget(data.id)
                .then((target) => {
                    resolve(target);
                    return;
                }).catch((err) => {
                    reject({ success: false, errors: [ {field: 'target', errors: [err] } ] });
                    return;
                });
        });
    }
}

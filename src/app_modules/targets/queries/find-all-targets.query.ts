import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ITargetDocument } from '../../../domain/app/targets/target';
import { Targets } from '../../../domain/app/targets/target.model';
import { field } from '../../../framework/decorators/field.decorator';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindAllTargetsActivity } from '../activities/find-all-targets.activity';
import { TargetResponse } from '../targets.types';

@injectable()
@query({
    name: 'findAllTargets',
    activity: FindAllTargetsActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: TargetResponse }
})
export class FindAllTargetsQuery implements IQuery<ITargetDocument[]> {
    constructor(@inject(Targets.name) private _targets: Targets) { }

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

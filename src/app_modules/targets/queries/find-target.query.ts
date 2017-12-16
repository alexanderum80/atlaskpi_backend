import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ITargetDocument } from '../../../domain/app/targets/target';
import { Targets } from '../../../domain/app/targets/target.model';
import { field } from '../../../framework/decorators/field.decorator';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindTargetActivity } from '../activities/find-target.activity';
import { TargetResponse } from '../targets.types';

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
    constructor(@inject(Targets.name) private _targets: Targets) { }

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

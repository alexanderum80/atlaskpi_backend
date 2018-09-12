import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindAllTargetsActivity } from '../activities/find-all-targets.activity';
import { TargetResponse } from '../targets.types';
import { ITargetNewDocument } from '../../../domain/app/targetsNew/target';
import { TargetsNew } from '../../../domain/app/targetsNew/target.model';

@injectable()
@query({
    name: 'findAllTargets',
    activity: FindAllTargetsActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: TargetResponse }
})
export class FindAllTargetsQuery implements IQuery<ITargetNewDocument[]> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) { }

    run(data: { filter: string,  }): Promise<ITargetNewDocument[]> {
        const that = this;
        return new Promise<ITargetNewDocument[]>((resolve, reject) => {
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

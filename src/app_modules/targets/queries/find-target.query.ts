import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindTargetActivity } from '../activities/find-target.activity';
import { TargetResponse } from '../targets.types';
import { ITargetNewDocument } from '../../../domain/app/targetsNew/target';
import { TargetsNew } from '../../../domain/app/targetsNew/target.model';

@injectable()
@query({
    name: 'findTarget',
    activity: FindTargetActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: TargetResponse }
})
export class FindTargetQuery implements IQuery<ITargetNewDocument> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) { }

    run(data: { id: string }): Promise<ITargetNewDocument> {
        const that = this;

        return new Promise<ITargetNewDocument>((resolve, reject) => {
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

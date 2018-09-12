import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { TargetResponse } from '../targets.types';
import { FindTargetByIdActivity } from '../activities/find-target-by-id.activity';
import { ITargetNewDocument } from '../../../domain/app/targetsNew/target';
import { TargetsNew } from '../../../domain/app/targetsNew/target.model';

@injectable()
@query({
    name: 'findTargetById',
    activity: FindTargetByIdActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: TargetResponse }
})
export class FindTargetByIdQuery implements IQuery<ITargetNewDocument> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) { }

    run(data: { id: string }): Promise<ITargetNewDocument> {
        const that = this;

        return new Promise<ITargetNewDocument>((resolve, reject) => {
            that._targets.model.findTargetById(data.id)
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

import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isArray } from 'util';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { TargetResponse } from '../../targets/targets.types';
import { TargetByDateActivity } from '../activities/target-by-date.activity';
import { ITargetNewDocument } from '../../../domain/app/targetsNew/target';
import { TargetsNew } from '../../../domain/app/targetsNew/target.model';

@injectable()
@query({
    name: 'targetByDate',
    activity: TargetByDateActivity,
    parameters: [
        { name: 'date', type: String },
    ],
    output: { type: TargetResponse, isArray: true }
})
export class TargetByDateQuery implements IQuery<ITargetNewDocument[]> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) { }

    run(data: { date: string }): Promise<ITargetNewDocument[]> {
        const that = this;

        return new Promise<ITargetNewDocument[]>((resolve, reject) => {
            that._targets.model.findTargetByDate(data.date)
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

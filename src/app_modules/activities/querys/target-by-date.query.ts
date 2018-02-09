import { isArray } from 'util';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ITargetDocument } from '../../../domain/app/targets/target';
import { Targets } from '../../../domain/app/targets/target.model';
import { field } from '../../../framework/decorators/field.decorator';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { TargetByDateActivity } from '../activities/target-by-date.activity';
import { TargetResponse } from '../../targets/targets.types';

@injectable()
@query({
    name: 'targetByDate',
    activity: TargetByDateActivity,
    parameters: [
        { name: 'date', type: String },
    ],
    output: { type: TargetResponse, isArray: true }
})
export class TargetByDateQuery implements IQuery<ITargetDocument[]> {
    constructor(@inject(Targets.name) private _targets: Targets) { }

    run(data: { date: string }): Promise<ITargetDocument[]> {
        const that = this;

        return new Promise<ITargetDocument[]>((resolve, reject) => {
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

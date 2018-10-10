import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { TargetsNew } from '../../../domain/app/targetsNew/target.model';
import { ITargetNewDocument } from '../../../domain/app/targetsNew/target';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListTargetsNewActivity } from '../activities/list-targets.activity';
import { TargetNew } from '../target.types';


@injectable()
@query({
    name: 'targetsNew',
    activity: ListTargetsNewActivity,
    output: { type: TargetNew, isArray: true }
})
export class TargetsNewQuery implements IQuery<ITargetNewDocument[]> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) { }

    run(data: { id: string }): Promise<ITargetNewDocument[]> {
        return this._targets.model.targetsNew();
    }
}

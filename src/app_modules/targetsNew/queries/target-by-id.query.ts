import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ITargetNewDocument } from '../../../domain/app/targetsNew/target';
import { TargetsNew} from '../../../domain/app/targetsNew/target.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { TargetNewByIdActivity } from '../activities/target-by-id.activity';
import { TargetNew } from '../target.types';


@injectable()
@query({
    name: 'targetNewById',
    activity: TargetNewByIdActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: TargetNew }
})
export class TargetNewByIdQuery implements IQuery<ITargetNewDocument> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) { };

    run(data: { id: string }): Promise<ITargetNewDocument> {
        return this._targets.model.targetNewById(data.id);
    }
}

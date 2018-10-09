import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';

import { ITargetNewDocument, SourceNew } from '../../../domain/app/targetsNew/target';
import { field } from '../../../framework/decorators/field.decorator';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { TargetNew, SourceNewInput } from '../target.types';
import { TargetNewByNameActivity } from '../activities/target-by-name.activity';
import { TargetsNew } from '../../../domain/app/targetsNew/target.model';

@injectable()
@query({
    name: 'targetByName',
    activity: TargetNewByNameActivity,
    parameters: [
        { name: 'name', type: String },
    ],
    output: { type: TargetNew }
})
export class TargetByNameQuery implements IQuery<ITargetNewDocument> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) { }

    async run(data: { name: string }): Promise<ITargetNewDocument> {
        try {
            if (!data.name) {
                return null;
            }

            return await this._targets.model.targetByName(data.name);
        } catch (err) {
            throw new Error('error finding target by source');
        }
    }
}

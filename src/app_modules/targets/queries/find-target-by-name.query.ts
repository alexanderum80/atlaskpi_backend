import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindTargetByNameActivity } from '../activities/find-target-by-name.activity';
import { TargetResponse } from '../targets.types';
import { ITargetNewDocument } from '../../../domain/app/targetsNew/target';
import { TargetsNew } from '../../../domain/app/targetsNew/target.model';

@injectable()
@query({
    name: 'findTargetByName',
    activity: FindTargetByNameActivity,
    parameters: [
        { name: 'name', type: String },
    ],
    output: { type: TargetResponse }
})
export class FindTargetByNameQuery implements IQuery<ITargetNewDocument> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) { }

    async run(data: { name: string }): Promise<ITargetNewDocument> {
        try {
            if (!data.name) {
                return null;
            }

            const targetByName = await this._targets.model.findTargetByName(data.name);
            if (isEmpty(targetByName)) {
                return null;
            }

            return targetByName;
        } catch (err) {
            throw new Error('error finding target by name');
        }
    }
}

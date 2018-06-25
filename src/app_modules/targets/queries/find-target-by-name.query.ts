import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';

import { ITargetDocument } from '../../../domain/app/targets/target';
import { Targets } from '../../../domain/app/targets/target.model';
import { field } from '../../../framework/decorators/field.decorator';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { TargetResponse } from '../targets.types';
import { FindTargetByNameActivity } from '../activities/find-target-by-name.activity';

@injectable()
@query({
    name: 'findTargetByName',
    activity: FindTargetByNameActivity,
    parameters: [
        { name: 'name', type: String },
    ],
    output: { type: TargetResponse }
})
export class FindTargetByNameQuery implements IQuery<ITargetDocument> {
    constructor(@inject(Targets.name) private _targets: Targets) { }

    async run(data: { name: string }): Promise<ITargetDocument> {
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

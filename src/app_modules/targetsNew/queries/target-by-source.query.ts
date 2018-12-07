import { inject, injectable } from 'inversify';

import { ITargetNewDocument,  ISourceNewInput } from '../../../domain/app/targetsNew/target';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { TargetNew, SourceNewInput} from '../target.types';
import { TargetNewByChartActivity } from '../activities/target-by-source.activity';
import { TargetsNew } from '../../../domain/app/targetsNew/target.model';

@injectable()
@query({
    name: 'targetBySource',
    activity: TargetNewByChartActivity,
    parameters: [
        { name: 'source', type: SourceNewInput },
    ],
    output: { type: TargetNew, isArray: true }
})
export class TargetBySourceQuery implements IQuery<ITargetNewDocument[]> {
    constructor(@inject(TargetsNew.name) private _targets: TargetsNew) { }

    async run(data: { source: ISourceNewInput }): Promise<ITargetNewDocument[]> {
        try {
            if (!data.source.identifier) {
                return null;
            }

            return await this._targets.model.targetBySource(data.source.identifier);
        } catch (err) {
            throw new Error('error finding target by source');
        }
    }
}

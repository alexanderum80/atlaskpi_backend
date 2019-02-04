import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListFunnelActivity } from '../activities/list-funnel.activity';
import { FunnelType } from '../funnels.types';
import { Funnels } from '../../../domain/app/funnels/funnel.model';
import { FunnelByIdActivity } from '../activities/funnel-by-id-activity';
import { IFunnelDocument } from '../../../domain/app/funnels/funnel';

@injectable()
@query({
    name: 'funnelById',
    activity: FunnelByIdActivity,
    parameters: [ { name: 'id', type: String, required: true }],
    output: { type: FunnelType }
})
export class FunnelByIdQuery implements IQuery<IFunnelDocument> {
    constructor(@inject(Funnels.name) private _funnels: Funnels) { }

    run(data: {id: string}): Promise<IFunnelDocument> {
       return this._funnels.model.funnelById(data.id);
    }
}

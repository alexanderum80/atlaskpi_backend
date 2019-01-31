import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListFunnelActivity } from '../activities/list-funnel.activity';
import { FunnelType } from '../funnels.types';
import { Funnels } from '../../../domain/app/funnels/funnel.model';
import { IFunnelDocument } from '../../../domain/app/funnels/funnel';

@injectable()
@query({
    name: 'funnels',
    activity: ListFunnelActivity,
    output: { type: FunnelType, isArray: true }
})
export class FunnelListQuery implements IQuery<IFunnelDocument[]> {
    constructor(@inject(Funnels.name) private _funnels: Funnels) { }

    run(data: {}): Promise<IFunnelDocument[]> {
        return this._funnels.model.listFunnels();
    }
}

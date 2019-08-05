import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListFunnelActivity } from '../activities/list-funnel.activity';
import { FunnelType } from '../funnels.types';
import { Funnels } from '../../../domain/app/funnels/funnel.model';
import { IFunnelDocument } from '../../../domain/app/funnels/funnel';
import { CurrentUser } from '../../../domain/app/current-user';
import { Logger } from '../../../domain/app/logger';

@injectable()
@query({
    name: 'funnels',
    activity: ListFunnelActivity,
    output: { type: FunnelType, isArray: true }
})
export class FunnelListQuery implements IQuery<IFunnelDocument[]> {
    constructor(
        @inject(Funnels.name) private _funnels: Funnels,
        @inject('Logger') private _logger: Logger,
        @inject('CurrentUser') private _currentUser: CurrentUser
    ) { }

    run(data: {}): Promise<IFunnelDocument[]> {

        if (!this._currentUser || !this._currentUser.get()) {
            this._logger.error('No user logged in at this point, funnel list cannot be generated at this time');
            return Promise.resolve([]);
        }

         const query = {};

         if (!this._currentUser.get().roles.find(r => r.name === 'owner')) {
             query['$or'] = [
                 { createdBy: this._currentUser.get()._id },
                 { users: { $in: [this._currentUser.get()._id]} }
             ];
         }

        return this._funnels.model.listFunnels(query);
    }
}

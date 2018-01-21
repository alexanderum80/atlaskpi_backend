import { IAccessLogDocument } from '../../../domain/app/access-log/access-log';
import { from } from 'apollo-link/lib';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { UsersActivity } from '../activities.types';
import { AccessLogs } from '../../../domain/app/access-log/access-log.model';
import { UsersActivityByDateActivity } from '../activities/users-activity-by-date.activity';

@injectable()
@query({
    name: 'usersActivityByDateRange',
    activity: UsersActivityByDateActivity,
    parameters: [
        { name: 'from', type: String, required: true },
        { name: 'to', type: String, required: true },
    ],
    output: { type: UsersActivity, isArray: true }
})
export class UsersActivityByDateRangeQuery extends MutationBase<IAccessLogDocument[]> {
    constructor(@inject(AccessLogs.name) private _accessLog: AccessLogs) {
        super();
    }

    run(data: { from: string, to: string }): Promise<IAccessLogDocument[]> {
        return this._accessLog.model.getAccessLogsByDate(data.from, data.to);
    }
}

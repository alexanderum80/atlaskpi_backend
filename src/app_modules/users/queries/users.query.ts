import { IUserDocument } from '../../../domain/app/security/users';
import { IPagedQueryResult, IPaginationDetails } from '../../../framework/queries';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Users } from '../../../domain';
import { UserPagedQueryResult } from '../users.types';
import { SearchUsersActivity } from '../activities';
import { PaginationDetails } from '../../shared';

@injectable()
@query({
    name: 'users',
    activity: SearchUsersActivity,
    parameters: [
        { name: 'details', type: PaginationDetails },
    ],
    output: { type: UserPagedQueryResult }
})
export class UsersQuery implements IQuery<IPagedQueryResult<IUserDocument>> {
    constructor(@inject('Users') private _users: Users) {
        
    }

    run(data: { details: IPaginationDetails }): Promise<IPagedQueryResult<IUserDocument>> {
        return this._users.model.search(data);
    }
}

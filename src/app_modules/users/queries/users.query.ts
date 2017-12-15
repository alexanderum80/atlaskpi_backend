import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IUserDocument } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IPagedQueryResult, IPaginationDetails } from '../../../framework/queries/pagination';
import { IQuery } from '../../../framework/queries/query';
import { PaginationDetails } from '../../shared/shared.types';
import { SearchUsersActivity } from '../activities/search-users.activity';
import { UserPagedQueryResult } from '../users.types';

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
    constructor(@inject('Users') private _users: Users) { }

    run(data: IPaginationDetails ): Promise<IPagedQueryResult<IUserDocument>> {
        return this._users.model.search(data);
    }
}

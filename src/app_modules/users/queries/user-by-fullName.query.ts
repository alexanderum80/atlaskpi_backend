import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { CurrentUser } from '../../../domain/app/current-user';
import { IUserDocument } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { User } from '../users.types';
import { FindUserByfullNameActivity } from '../activities/find-user-by-fullName.activity';

@injectable()
@query({
    name: 'findByFullName',
    activity: FindUserByfullNameActivity,
    parameters: [
        { name: 'firstName', type: String },
        { name: 'lastName', type: String },
    ],
    output: { type: User }
})
export class FindByFullNameQuery implements IQuery<IUserDocument> {
    constructor(
        @inject(Users.name) private _users: Users,
        @inject(CurrentUser.name) private _currentUser: CurrentUser
    ) { }

    run(data: { firstName: string, lastName: string }): Promise<IUserDocument> {
        return this._users.model.findByFullName(data.firstName, data.lastName);
    }
}

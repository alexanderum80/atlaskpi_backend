import * as [Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { CurrentUser } from '../../../domain/app/current-user';
import { IUserDocument } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindUserByUserNameActivity } from '../activities/find-user-by-username.activity';
import { User } from '../users.types';

@injectable()
@query({
    name: 'UserHelpCenter',
    activity: FindUserByUserNameActivity,
    parameters: [
        { name: 'username', type: String },
    ],
    output: { type: User }
})
export class UserHelpCenterQuery implements IQuery<IUserDocument> {
    constructor(
        @inject(Users.name) private _users: Users,
        @inject(CurrentUser.name) private _currentUser: CurrentUser
    ) { }

    run(data: { username: string }): Promise<IUserDocument> {
        // If not id specified return the own user
        if (!data || !data.username) {
            return Promise.resolve(this._currentUser.get().toObject() as IUserDocument);
        }
        return this._users.model.findByUserHelpCenter(data.username);
    }
}

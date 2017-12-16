import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { CurrentUser } from '../../../../di';
import { IUserDocument } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindUserByIdActivity } from '../activities/find-user-by-id.activity';
import { User } from '../users.types';

@injectable()
@query({
    name: 'User',
    activity: FindUserByIdActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: User }
})
export class UserQuery implements IQuery<IUserDocument> {
    constructor(
        @inject(Users.name) private _users: Users,
        @inject(CurrentUser.name) private _currentUser: CurrentUser
    ) { }

    run(data: { id: string }): Promise<IUserDocument> {
        // If not id specified return the own user
        if (!data || !data.id) {
            return Promise.resolve(this._currentUser.get().toObject() as IUserDocument);
        }
        return this._users.model.findUserById(data.id);
    }
}

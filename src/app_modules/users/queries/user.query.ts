
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Users, IUserDocument } from '../../../domain';
import { User } from '../users.types';
import { FindUserByIdActivity } from '../activities';
import { CurrentUser } from '../../../../di';

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
        @inject('Users') private _users: Users,
        @inject('CurrentUser') private _currentUser: CurrentUser
    ) { }

    run(data: { id: string }): Promise<IUserDocument> {
        // If not id specified return the own user
        if (!data || !data.id) {
            return Promise.resolve(this._currentUser.get().toObject() as IUserDocument);
        }
        return this._users.model.findUserById(data.id);
    }
}

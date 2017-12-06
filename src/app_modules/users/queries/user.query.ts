
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Users, IUserDocument } from '../../../domain';
import { User } from '../users.types';
import { FindUserByIdActivity } from '../activities';

@injectable()
@query({
    name: 'User',
    activity: FindUserByIdActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: User }
})
export class UserQuery extends QueryBase<IUserDocument> {
    constructor(
        @inject('Users') private _users: Users,
        @inject('CurrentUser') private _currentUser: IUserDocument
    ) {
        super();
    }

    run(data: { id: string }): Promise<IUserDocument> {
        // If not id specified return the own user
        if (!data || !data.id) {
            return Promise.resolve(this._currentUser);
        }
        return this._users.model.findUserById(data.id);
    }
}

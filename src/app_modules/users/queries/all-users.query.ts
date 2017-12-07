
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Users, IUserDocument } from '../../../domain';
import { User } from '../users.types';
import { FindAllUsersActivity } from '../activities';

@injectable()
@query({
    name: 'allUsers',
    activity: FindAllUsersActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: User, isArray: true }
})
export class AllUsersQuery implements IQuery<IUserDocument[]> {
    constructor(@inject('Users') private _users: Users) {
        
    }

    run(data: { filter: string }): Promise<IUserDocument[]> {
        return this._users.model.findAllUsers(data.filter);
    }
}

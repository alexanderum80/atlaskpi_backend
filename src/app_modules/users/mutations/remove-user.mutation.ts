
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { MutationBase, mutation } from '../../../framework';
import { Users } from '../../../domain';
import { CreateUserResult } from '../users.types';
import { RemoveUserActivity } from '../activities';

@injectable()
@mutation({
    name: 'removeUser',
    activity: RemoveUserActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: CreateUserResult }
})
export class RemoveUserMutation extends MutationBase<CreateUserResult> {
    constructor(@inject('Users') private _users: Users) {
        super();
    }

    run(data: { id: string,  }): Promise<CreateUserResult> {
        return this._users.model.removeUser(data.id);
    }
}

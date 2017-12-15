import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Users } from '../../../domain/app/security/users/user.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { RemoveUserActivity } from '../activities/remove-user.activity';
import { CreateUserResult } from '../users.types';

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

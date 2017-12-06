import { ICreateUserDetails } from '../../../domain/common';
import { AccountCreatedNotification } from '../../../services/notifications/users';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { MutationBase, mutation } from '../../../framework';
import { Users } from '../../../domain';
import { CreateUserResult, UserDetails } from '../users.types';
import { CreateUserActivity } from '../activities';

@injectable()
@mutation({
    name: 'createUser',
    activity: CreateUserActivity,
    parameters: [
        { name: 'data', type: UserDetails },
    ],
    output: { type: CreateUserResult }
})
export class CreateUserMutation extends MutationBase<CreateUserResult> {
    constructor(
        @inject('Users') private _users: Users,
        @inject('AccountCreatedNotification') private _accountCreatedNotification: AccountCreatedNotification
    ) {
        super();
    }

    run(data: ICreateUserDetails): Promise<CreateUserResult> {
        return this._users.model.createUser(data, this._accountCreatedNotification);
    }
}

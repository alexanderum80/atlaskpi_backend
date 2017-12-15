import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Users } from '../../../domain/app/security/users/user.model';
import { ICreateUserDetails } from '../../../domain/common/create-user';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { AccountCreatedNotification } from '../../../services/notifications/users/account-created.notification';
import { CreateUserActivity } from '../activities/create-user.activity';
import { CreateUserResult, UserDetails } from '../users.types';

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

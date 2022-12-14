import { AccountCreatedNotification } from '../../../services/notifications/users/account-created.notification';
import { Users } from '../../../domain/app/security/users/user.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ICreateUserDetails } from '../../../domain/common/create-user';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { CreateUserActivity } from '../activities/create-user.activity';
import { CreateUserResult, UserDetails } from '../users.types';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';

@injectable()
@mutation({
    name: 'createUser',
    activity: CreateUserActivity,
    parameters: [
        { name: 'data', type: UserDetails },
    ],
    output: { type: CreateUserResult }
})
export class CreateUserMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Users.name) private _users: Users,
        @inject(AccountCreatedNotification.name) private _accountCreatedNotification: AccountCreatedNotification) {
        super();
    }

    run(data: ICreateUserDetails): Promise<IMutationResponse> {
        return this._users.model.createUser(data, this._accountCreatedNotification, { notifyUser: true });
    }
}

import { IAppConfig } from '../../../configuration/config-models';
import { UserForgotPasswordNotification } from '../../../services/notifications/users/user-forgot-password.notification';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { MutationBase, mutation } from '../../../framework';
import { Users } from '../../../domain';
import { ForgotPasswordResult } from '../users.types';
import { UserForgotPasswordActivity } from '../activities';

@injectable()
@mutation({
    name: 'userForgotPassword',
    activity: UserForgotPasswordActivity,
    parameters: [
        { name: 'email', type: String, required: true },
    ],
    output: { type: ForgotPasswordResult }
})
export class UserForgotPasswordMutation extends MutationBase<ForgotPasswordResult> {
    constructor(
        @inject('Config') private _config: IAppConfig,
        @inject('Users') private _users: Users,
        @inject('UserForgotPasswordNotification') private _userForgotPasswordNotification: UserForgotPasswordNotification
    ) {
        super();
    }

    run(data: { email: string,  }): Promise<ForgotPasswordResult> {
        return this._users.model.forgotPassword(data.email, this._config.usersService.usernameField, this._userForgotPasswordNotification)
        .then((sentInfo) => {
            return { success: true };
        }, (err) => {
            return { success: false };
        });
    }
}

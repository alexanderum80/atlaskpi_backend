import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IAppConfig } from '../../../configuration/config-models';
import { Users } from '../../../domain/app/security/users/user.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { UserForgotPasswordNotification } from '../../../services/notifications/users/user-forgot-password.notification';
import { UserForgotPasswordActivity } from '../activities/user-forgot-password.activity';
import { ForgotPasswordResult } from '../users.types';

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
        @inject(Users.name) private _users: Users,
        @inject(UserForgotPasswordNotification.name) private _userForgotPasswordNotification: UserForgotPasswordNotification
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

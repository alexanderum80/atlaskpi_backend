import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';

import { IAppConfig } from '../../../configuration/config-models';
import { Users } from '../../../domain/app/security/users/user.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { UserForgotPasswordNotification } from '../../../services/notifications/users/user-forgot-password.notification';
import { UserForgotPasswordActivity } from '../activities/user-forgot-password.activity';
import { ErrorSuccessResult } from '../users.types';
import {UserPasswordService} from '../../../services/user-password.service';

@injectable()
@mutation({
    name: 'userForgotPassword',
    activity: UserForgotPasswordActivity,
    parameters: [
        { name: 'email', type: String, required: true },
        { name: 'companyName', type: String }
    ],
    output: { type: ErrorSuccessResult }
})
export class UserForgotPasswordMutation extends MutationBase<ErrorSuccessResult> {
    constructor(
        @inject(UserPasswordService.name) private _userPasswordSvc
    ) {
        super();
    }

    async run(data: { email: string, companyName: string }): Promise<ErrorSuccessResult> {
        const dependencies = await this._userPasswordSvc.instantiateDependencies(data);
        return await this._userPasswordSvc.forgotPassword();
    }
}

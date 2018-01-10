import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IUserProfile } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ResetPasswordActivity } from '../activities/reset-password.activity';
import { InputUserProfile, ResetPasswordResult } from '../users.types';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';

@injectable()
@mutation({
    name: 'resetPassword',
    activity: ResetPasswordActivity,
    parameters: [
        { name: 'token', type: String, required: true },
        { name: 'password', type: String, required: true },
        { name: 'profile', type: InputUserProfile },
        { name: 'enrollment', type: Boolean },
    ],
    output: { type: ResetPasswordResult }
})
export class ResetPasswordMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Users.name) private _users: Users) {
        super();
    }

    run(data: { token: string, password: string, profile: IUserProfile, enrollment: boolean }): Promise<IMutationResponse> {
        return this._users.model.resetPassword(data.token, data.password, data.profile, data.enrollment || false);
    }
}

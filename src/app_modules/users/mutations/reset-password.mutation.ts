import { IUserProfile } from '../../../domain/app/security/users';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { MutationBase, mutation } from '../../../framework';
import { Users } from '../../../domain';
import { ResetPasswordResult, InputUserProfile } from '../users.types';
import { ResetPasswordActivity } from '../activities';

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
export class ResetPasswordMutation extends MutationBase<ResetPasswordResult> {
    constructor(@inject('Users') private _users: Users) {
        super();
    }

    run(data: { token: string, password: string, profile: IUserProfile, enrollment: boolean,  }): Promise<ResetPasswordResult> {
        return this._users.model.resetPassword(data.token, data.password, data.profile, data.enrollment || false);
    }
}

import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';

import { IUserProfile } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ResetPasswordActivity } from '../activities/reset-password.activity';
import { InputUserProfile, ErrorSuccessResult } from '../users.types';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import {UserPasswordService} from '../../../services/user-password.service';

@injectable()
@mutation({
    name: 'resetPassword',
    activity: ResetPasswordActivity,
    parameters: [
        { name: 'token', type: String, required: true },
        { name: 'password', type: String, required: true },
        { name: 'profile', type: InputUserProfile },
        { name: 'enrollment', type: Boolean },
        { name: 'companyName', type: String }
    ],
    output: { type: ErrorSuccessResult }
})
export class ResetPasswordMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(UserPasswordService.name) private _userPasswordSvc
    ) {
        super();
    }

    async run(data: { token: string, password: string, profile: IUserProfile, enrollment: boolean, companyName?: string }): Promise<IMutationResponse> {
        const dependencies = await this._userPasswordSvc.instantiateDependencies(data);
        return await this._userPasswordSvc.resetPassword();
    }
}

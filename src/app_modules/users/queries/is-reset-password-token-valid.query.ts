import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';

import { IAppConfig } from '../../../configuration/config-models';
import { Users } from '../../../domain/app/security/users/user.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { VerifyResetPasswordActivity } from '../activities/verify-reset-password.activity';
import { TokenVerification } from '../users.types';
import {UserPasswordService} from '../../../services/user-password.service';

@injectable()
@query({
    name: 'isResetPasswordTokenValid',
    activity: VerifyResetPasswordActivity,
    parameters: [
        { name: 'token', type: String, required: true },
        { name: 'companyName', type: String }
    ],
    output: { type: TokenVerification }
})
export class IsResetPasswordTokenValidQuery implements IQuery<boolean> {
    constructor(
        @inject(UserPasswordService.name) private _userPasswordSvc,
        @inject('Config') private _config: IAppConfig) { }

    async run(data: { token: string, companyName: string }): Promise<boolean> {
        const dependencies = await this._userPasswordSvc.instantiateDependencies(data);
        return await this._userPasswordSvc.isResetPasswordTokenValid();
    }
}

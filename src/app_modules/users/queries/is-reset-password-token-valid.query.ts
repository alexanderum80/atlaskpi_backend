import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IAppConfig } from '../../../configuration/config-models';
import { Users } from '../../../domain/app/security/users/user.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { VerifyResetPasswordActivity } from '../activities/verify-reset-password.activity';
import { TokenVerification } from '../users.types';

@injectable()
@query({
    name: 'isResetPasswordTokenValid',
    activity: VerifyResetPasswordActivity,
    parameters: [
        { name: 'token', type: String, required: true },
    ],
    output: { type: TokenVerification }
})
export class IsResetPasswordTokenValidQuery implements IQuery<boolean> {
    constructor(
        @inject(Users.name) private _users: Users,
        @inject('Config') private _config: IAppConfig) { }

    run(data: { token: string }): Promise<boolean> {
        return this._users.model.verifyResetPasswordToken(data.token, this._config.token.expiresIn);
    }
}

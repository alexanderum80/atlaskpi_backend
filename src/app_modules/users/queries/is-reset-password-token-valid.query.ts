import { IAppConfig } from '../../../configuration/config-models';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Users } from '../../../domain';
import { TokenVerification } from '../users.types';
import { VerifyResetPasswordActivity } from '../activities';

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
        @inject('Users') private _users: Users,
        @inject('Config') private _config: IAppConfig) {
        
    }

    run(data: { token: string }): Promise<boolean> {
        return this._users.model.verifyResetPasswordToken(data.token, this._config.token.expiresIn);
    }
}

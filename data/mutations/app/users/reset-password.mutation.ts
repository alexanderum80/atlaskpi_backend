import { IIdentity, IUserModel } from '../../..';
import { IMutationResponse } from '../../..';
import * as Promise from 'bluebird';
import { IMutation, IValidationResult } from '../..';
import { IAppConfig } from '../../../../config';

export class ResetPasswordMutation implements IMutation<IMutationResponse> {

    constructor(
        public identity: IIdentity,
        private _UserModel: IUserModel) { }

    // log = true;
    // audit = true;

    run(data: { token: string, password: string }): Promise<IMutationResponse> {
        return this._UserModel.resetPassword(data.token, data.password);
    }
}

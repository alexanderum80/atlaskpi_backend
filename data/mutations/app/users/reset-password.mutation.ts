import { MutationBase } from '../../mutation-base';
import { IIdentity, IUserModel } from '../../..';
import { IMutationResponse } from '../../..';
import * as Promise from 'bluebird';
import { IMutation, IValidationResult } from '../..';

export class ResetPasswordMutation extends MutationBase<IMutationResponse> {

    constructor(
        public identity: IIdentity,
        private _UserModel: IUserModel) {
            super(identity);
        }

    // log = true;
    // audit = true;

    run(data: { token: string, password: string, enrollment?: boolean }): Promise<IMutationResponse> {
        return this._UserModel.resetPassword(data.token, data.password, data.enrollment || false);
    }
}

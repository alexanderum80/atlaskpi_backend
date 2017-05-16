import { IMutationResponse } from '../../../models/common';
import { IForgotPasswordNotifier } from '../../../../services';
import { IUserModel, IIdentity } from '../../..';
import { IMutation } from '../..';
import * as Promise from 'bluebird';
import { IAppConfig } from '../../../../config';
import * as nodemailer from 'nodemailer';

export class UserForgotPasswordMutation implements IMutation<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _forgotPasswordNotifier: IForgotPasswordNotifier,
        private _UserModel: IUserModel) { }

    audit = true;

    run(data): Promise<IMutationResponse> {
        return this._UserModel.forgotPassword(data.email, this._forgotPasswordNotifier).then((sentInfo) => {
            return { success: true };
        }, (err) => {
            return { success: false };
        });
    }
}

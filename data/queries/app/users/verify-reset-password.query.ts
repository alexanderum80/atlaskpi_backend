import * as Promise from 'bluebird';
import { IQuery, IIdentity, IUserModel } from '../../..';

export interface IVerifyResetPasswordTokenMessage {
    token: string;
}

export class VerifyResetPasswordQuery implements IQuery<boolean> {

    constructor(
        public identity: IIdentity,
        private _UserModel: IUserModel) { }

    // log = true;
    // audit = true;

    run(data: IVerifyResetPasswordTokenMessage): Promise<boolean> {
        return this._UserModel.verifyResetPasswordToken(data.token);
    }
}

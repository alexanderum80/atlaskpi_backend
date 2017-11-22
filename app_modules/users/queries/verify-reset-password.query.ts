import { QueryBase } from '../../query-base';
import * as Promise from 'bluebird';
import { IQuery, IIdentity, IUserModel } from '../../..';

export interface IVerifyResetPasswordTokenMessage {
    token: string;
}

export class VerifyResetPasswordQuery extends QueryBase<boolean> {

    constructor(
        public identity: IIdentity,
        private _UserModel: IUserModel) {
            super(identity);
        }

    // log = true;
    // audit = true;

    run(data: IVerifyResetPasswordTokenMessage): Promise<boolean> {
        return this._UserModel.verifyResetPasswordToken(data.token);
    }
}

import { QueryBase } from '../../query-base';
import * as Promise from 'bluebird';
import { IQuery, IIdentity, IUserModel } from '../../..';

export interface IVerifyEnrollmentToken {
    token: string;
}

export class VerifyEnrollmentQuery extends QueryBase<boolean> {

    constructor(public identity: IIdentity,
                private _UserModel: IUserModel) {
                    super(identity);
                }

    // log = true;
    // audit = true;

    run(data: IVerifyEnrollmentToken): Promise<boolean> {
        return this._UserModel.verifyEnrollmentToken(data.token);
    }
}

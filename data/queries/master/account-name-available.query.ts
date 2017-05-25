import * as Promise from 'bluebird';
import { IQuery } from '..';
import { IIdentity, IAccountModel } from '../../';

export interface IAccountNameVerificationDetails {
    name: string;
}

export class AccountNameAvailableQuery implements IQuery<Boolean> {

    constructor(public identity: IIdentity,
                private _AccountModel: IAccountModel) { }

    // log = true;
    // audit = true;

    run(data: IAccountNameVerificationDetails): Promise<Boolean> {
        return this._AccountModel.accountNameAvailable(data.name);
    }
}

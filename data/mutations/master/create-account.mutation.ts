import { IAccountModel, IIdentity, IAccount } from '../..';
import { IMutation, IValidationResult } from '..';
import * as Promise from 'bluebird';

export class CreateAccountMutation implements IMutation<IAccount> {

    constructor(
        public identity: IIdentity,
        private _AccountModel: IAccountModel) { }

    audit = true;

    run(data: IAccount): Promise<IAccount> {
        return this._AccountModel.createNewAccount(data);
    }
}

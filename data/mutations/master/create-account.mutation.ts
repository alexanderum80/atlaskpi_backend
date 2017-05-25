import { IMutationResponse } from '../../models/common';
import { IAccountModel, IIdentity, IAccount } from '../..';
import { IMutation, IValidationResult } from '..';
import * as Promise from 'bluebird';

export class CreateAccountMutation implements IMutation<IMutationResponse> {

    constructor(
        public identity: IIdentity,
        private _AccountModel: IAccountModel) { }

    audit = true;

    run(data: any): Promise<IMutationResponse> {
        return this._AccountModel.createNewAccount(data.account);
    }
}

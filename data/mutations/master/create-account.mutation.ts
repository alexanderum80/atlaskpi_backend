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
        return this._AccountModel.createNewAccount('127.0.0.1', 'initial user', 'No details... account creation', data.account);
    }
}

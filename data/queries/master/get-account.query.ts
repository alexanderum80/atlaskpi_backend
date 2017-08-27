import { IAccountModel, IIdentity, IAccount } from '../..';
import { IQuery } from '..';
import * as Promise from 'bluebird';

export class GetAccountQuery implements IQuery<IAccount> {

    constructor(
        public identity: IIdentity,
        private _AccountModel: IAccountModel) { }

    run(data: any): Promise<IAccount> {
        return new Promise<IAccount>((resolve, reject) => {
            this._AccountModel.findOne(data).then((account) => {
                if (!account) {
                    reject({ name: 'not-found', message: 'Account not found' });
                }

                resolve(account);
            }, (err) => {
                reject(err);
            });
        });
    }
}

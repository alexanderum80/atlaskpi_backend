import { IAccountDocument } from '../../models/master/accounts';
import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IUserModel } from '../../models/app/users';
import { IAccountModel, IIdentity, IAccount } from '../..';
import { IQuery } from '..';
import * as Promise from 'bluebird';

export class GetIsDemoModeQuery implements IQuery<boolean> {

    constructor(
        public identity: IIdentity,
        private _account: IAccountDocument,
        private _UserModel: IUserModel) { }

    run(data: any): Promise<boolean> {
        const that = this;
        return new Promise<boolean>((resolve, reject) => {
            // make sure this request is from a logged user
            if (!this._UserModel) {
                return resolve(false);
            }

            const inDemo = that._account.demoMode === undefined ? false : that._account.demoMode;

            resolve(inDemo);
        });
    }
}


import { IUserDocument, IUserModel } from '../../../models/app/users/IUser';
import * as Promise from 'bluebird';
import { IIdentity } from '../../../';
import { QueryBase } from '../../query-base';

export class FindAllUsersQuery extends QueryBase<IUserDocument[]> {
    constructor(public identity: IIdentity,
                private _IUserModel: IUserModel) {
                    super(identity);
                }

    run(data: any): Promise<IUserDocument[]> {
        return this._IUserModel.findAllUsers(data.filter);
    }
}
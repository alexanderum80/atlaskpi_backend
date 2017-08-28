import { IQueryResponse } from '../../../models/common';
import { IUserDocument, IUserModel } from '../../../models/app/users/IUser';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';

export class FindAllUsersQuery implements IQueryResponse<IUserDocument[]>{
    constructor(public identity: IIdentity,
                private _IUserModel: IUserModel) {}

    run(data: any): Promise<IQueryResponse<IUserDocument[]>> {
        return this._IUserModel.findAllUsers(data);
    }
}
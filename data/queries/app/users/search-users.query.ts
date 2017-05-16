import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserDocument, IUserModel, IPaginationDetails, IPagedQueryResult } from '../../../';

export class SearchUsersQuery implements IQuery<IPagedQueryResult<IUserDocument>> {

    constructor(
        public identity: IIdentity,
        private _UserModel: IUserModel) { }

    // log = true;
    // audit = true;

    run(data: IPaginationDetails): Promise<IPagedQueryResult<IUserDocument>> {
        return this._UserModel.search(data);
    }
}

import { QueryBase } from '../../query-base';
import { IQueryResponse } from '../../../models/common/query-response';
import { IUserDocument, IUserModel } from '../../../models/app/users';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';

export class FindUserByIdQuery extends QueryBase<IUserDocument> {

    constructor(public identity: IIdentity, private _UserModel: IUserModel) {
        super(identity);
    }

    // log = true;
    // audit = true;

    run(data: any): Promise<IUserDocument> {
        // If not id specified return the own user
        if (!data || !data.id) {
            return this._UserModel.findByIdentity(this.identity);
        }
        return this._UserModel.findUserById(data.id);
    }
}

import { IUserslogDocument, IUserslogModel, IUserslog } from '../../../models/app/users-log/IUsers-log';
import { IQueryResponse } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../models/app/identity';

export class FindAllUsersLogsQuery {
    constructor(public identity: IIdentity, private _IUserslogModel: IUserslogModel) {}

    run(data: any): Promise<IUserslog[]> {
        return this._IUserslogModel.usersLog('');
    }
}
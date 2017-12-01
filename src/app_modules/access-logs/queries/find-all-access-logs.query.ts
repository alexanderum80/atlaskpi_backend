import { IIdentity } from '../../../models/app/identity';
import { IAccessLogDocument, IAccessModel } from '../../../models/app/access-log/IAccessLog';
import { IQueryResponse } from '../../../models/common';
import * as Promise from 'bluebird';
import { IQuery } from '../..';

export class FindAllAcessLogsQuery implements IQuery<IQueryResponse<IAccessLogDocument>> {
    constructor(public identity: IIdentity,
                private _AccessModel: IAccessModel) { }

    run(data: any): Promise<IQueryResponse<IAccessLogDocument>> {
        return this._AccessModel.getAllAccessLogs(data);
    }
}
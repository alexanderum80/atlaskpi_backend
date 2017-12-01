import { IAccessModel } from '../../../models/app/access-log/IAccessLog';
import { IIdentity } from '../../../models/app/identity';
import { IMutation } from '../..';
import { IMutationResponse } from '../../../models/common';
import * as Promise from 'bluebird';

export class CreateAccessLogMutation implements IMutation<IMutationResponse> {
    constructor(public identity: IIdentity,
                private _AccessLogModel: IAccessModel) {}

    run(data: any): Promise<IMutationResponse> {
        return this._AccessLogModel.createLog(data);
    }
}
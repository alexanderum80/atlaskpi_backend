import { IPermissionModel, IPermissionDocument, IPermissionInfo } from '../../../../lib/rbac/models';
import { IQueryResponse } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';

export class GetPermissionsQuery implements IQueryResponse<IPermissionInfo[]> {
    constructor(public identity: IIdentity, private _IPermissionModel: IPermissionModel) {}

    run(data: any): Promise<IPermissionInfo[]> {
        return this._IPermissionModel.findAllPermissions('');
    }
}
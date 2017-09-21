import { IQueryResponse } from '../../../models/common';
import { IRoleList, IRoleModel, RoleSchema } from '../../../../lib/rbac/models/roles';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';

export class GetRolesQuery {
    constructor(public identity: IIdentity, private _IRoleModel: IRoleModel) {}

    run(data: any): Promise<IRoleList[]> {
        return this._IRoleModel.findAllRoles('');
    }
}
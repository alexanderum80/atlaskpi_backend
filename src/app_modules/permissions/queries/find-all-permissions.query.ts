import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isArray } from 'util';

import { IPermissionInfo } from '../../../domain/app/security/permissions/permission';
import { Permissions } from '../../../domain/app/security/permissions/permission.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindAllPermissionsActivity } from '../activities/find-all-permissions.activity';
import { PermissionInfo } from '../permissions.types';


@injectable()
@query({
    name: 'findAllPermissions',
    activity: FindAllPermissionsActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: PermissionInfo, isArray: true }
})
export class FindAllPermissionsQuery implements IQuery<IPermissionInfo[]> {
    constructor(@inject('Permissions') private _permissions: Permissions) { }

    run(data: { filter: String,  }): Promise<IPermissionInfo[]> {
        return this._permissions.model.findAllPermissions('');
    }
}

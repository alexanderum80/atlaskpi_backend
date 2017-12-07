
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Permissions, IPermissionInfo } from '../../../domain';
import { PermissionInfo } from '../permissions.types';
import { FindAllPermissionsActivity } from '../activities';

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
    constructor(@inject('Permissions') private _permissions: Permissions) {
        
    }

    run(data: { filter: String,  }): Promise<IPermissionInfo[]> {
        return this._permissions.model.findAllPermissions('');
    }
}

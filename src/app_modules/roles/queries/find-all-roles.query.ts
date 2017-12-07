import { IRoleDocument } from '../../../domain/app/security/roles';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Roles } from '../../../domain';
import { RoleList } from '../roles.types';
import { FindAllRolesActivity } from '../activities';

@injectable()
@query({
    name: 'findAllRoles',
    activity: FindAllRolesActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: RoleList, isArray: true }
})
export class FindAllRolesQuery implements IQuery<IRoleDocument[]> {
    constructor(@inject('Roles') private _roles: Roles) {
        
    }

    run(data: { filter: String,  }): Promise<IRoleDocument[]> {
        return this._roles.model.findAllRoles('');
    }
}

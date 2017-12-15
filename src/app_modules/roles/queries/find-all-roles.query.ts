import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IRoleDocument } from '../../../domain/app/security/roles/role';
import { Roles } from '../../../domain/app/security/roles/role.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindAllRolesActivity } from '../activities/find-all-roles.activity';
import { RoleList } from '../roles.types';


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
    constructor(@inject('Roles') private _roles: Roles) { }

    run(data: { filter: String,  }): Promise<IRoleDocument[]> {
        return this._roles.model.findAllRoles('');
    }
}

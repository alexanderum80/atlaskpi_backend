import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IRoleDocument } from '../../../domain/app/security/roles/role';
import { Roles } from '../../../domain/app/security/roles/role.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { RoleList } from '../roles.types';
import { RoleByNameActivity } from '../activities/role-by-name.activity';


@injectable()
@query({
    name: 'roleByName',
    activity: RoleByNameActivity,
    parameters: [
        { name: 'name', type: String, required: true },
    ],
    output: { type: RoleList }
})
export class RoleByNameQuery implements IQuery<IRoleDocument> {
    constructor(@inject(Roles.name) private _roles: Roles) { }

    run(data: { name: string }): Promise<IRoleDocument> {
        return this._roles.model.roleByName(data.name);
    }
}

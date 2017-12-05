import { IRoleCustom } from '../../../domain/app/security/roles';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Roles } from '../../../domain';
import { RoleDetailsInput, Role } from '../roles.types';
import { CreateRoleActivity } from '../activities';

@injectable()
@mutation({
    name: 'createRole',
    activity: CreateRoleActivity,
    parameters: [
        { name: 'data', type: RoleDetailsInput },
    ],
    output: { type: Role }
})
export class CreateRoleMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Roles') private _roles: Roles) {
        super();
    }

    run(data: { data: IRoleCustom  }): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            return this._roles.model.createRole(data.data).then((response) => {
                return resolve({success: true, entity: response });
            }).catch((err) => {
                return resolve({ success: false, errors: [ { field: 'role', errors: [err] } ]});
            });
        });
    }
}

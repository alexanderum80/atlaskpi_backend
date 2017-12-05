import { IRoleResponse } from '../../../domain/app/security/roles';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Roles } from '../../../domain';
import { Role, RoleDetailsInput } from '../roles.types';
import { UpdateRoleActivity } from '../activities';

@injectable()
@mutation({
    name: 'updateRole',
    activity: UpdateRoleActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'data', type: RoleDetailsInput },
    ],
    output: { type: Role }
})
export class UpdateRoleMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Roles') private _roles: Roles) {
        super();
    }

    run(data: { id: string, data: IRoleResponse }): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            return this._roles.model.updateRole(data.id, data.data).then((response) => {
                return resolve({ success: true, entity: response });
            }).catch((err) => {
                return resolve({ success: false, errors: [ { field: 'role', errors: [err] } ]});
            });
        });
    }
}

import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IRoleResponse } from '../../../domain/app/security/roles/role';
import { Roles } from '../../../domain/app/security/roles/role.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateRoleActivity } from '../activities/update-role.activity';
import { Role, RoleDetailsInput } from '../roles.types';


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
    constructor(@inject(Roles.name) private _roles: Roles) {
        super();
    }

    run(data: { id: string, data: IRoleResponse }): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            return this._roles.model.updateRole(data.id, data.data).then((response) => {
                return resolve(response);
            }).catch((err) => {
                return resolve(null);
            });
        });
    }
}

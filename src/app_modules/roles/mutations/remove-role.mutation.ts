import { Users } from '../../../domain/app/security/users/user.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Roles } from '../../../domain/app/security/roles/role.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { RemoveRoleActivity } from '../activities/remove-role.activity';
import { RoleResult } from '../roles.types';


@injectable()
@mutation({
    name: 'removeRole',
    activity: RemoveRoleActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: RoleResult }
})
export class RemoveRoleMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Roles.name) private _roles: Roles,
        @inject(Users.name) private _users: Users) {
        super();
    }

    run(data: { id: string }): Promise<RoleResult> {
        return new Promise<RoleResult>((resolve, reject) => {
            let promises = [];
            const userExistRole = this._users.model.find({ roles: { $in: [data.id] } })
                .populate('roles', '-_id, name')
                .then((role) => {
                    return role;
                });
            promises.push(userExistRole);

            return Promise.all(promises).then((roleExist) => {
                /**
                 * roleExist: check if user is using a role
                 */
                return this._roles.model.removeRole(data.id, roleExist[0]).then((r) => {
                    return resolve({ success: true } as RoleResult);
                }).catch((err) => {
                    return resolve({ success: false, entity: err.entity, errors: [ { field: 'role', errors: [err.errors[0]] } ]} as RoleResult);
                });
            });
        });
    }
}

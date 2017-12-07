
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Roles } from '../../../domain';
import { RoleResult } from '../roles.types';
import { RemoveRoleActivity } from '../activities';

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
    constructor(@inject('Roles') private _roles: Roles) {
        super();
    }

    run(data: { id: string }): Promise<RoleResult> {
        return new Promise<RoleResult>((resolve, reject) => {
            let promises = [];
            let d = this._roles.model.find({ roles: { $in: [data.id] } })
                .populate('roles', '-_id, name')
                .then((role) => {
                    return role;
                });
            promises.push(d);

            return Promise.all(promises).then((roleExist) => {
                return this._roles.model.removeRole(data.id, roleExist[0]).then((r) => {
                    return resolve({ success: true } as RoleResult);
                }).catch((err) => {
                    return resolve({ success: false, errors: [ { field: 'role', errors: [err.errors[0]] } ]} as RoleResult);
                });
            });
        });
    }
}


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

    run(data: { id: string }): Promise<IMutationResponse> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            let promises = [];
            let d = this._UserModel.find({ roles: { $in: [data.id] } })
                .populate('roles', '-_id, name')
                .then((role) => {
                    return role;
                });
            promises.push(d);

            return Promise.all(promises).then((roleExist) => {
                return this.roles.model.removeRole(data.id, roleExist[0]).then((r) => {
                    return resolve({ success: true, entity: r});
                }).catch((err) => {
                    return resolve({ success: false, entity: err.entity, errors: [ { field: 'role', errors: [err.errors[0]] } ]});
                });
            });
        });
    }
}

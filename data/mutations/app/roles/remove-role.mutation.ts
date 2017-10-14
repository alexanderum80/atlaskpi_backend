import { IUserModel } from '../../../models/app/users';
import { IMutationResponse } from '../../../models/common';
import { IMutation } from '../..';
import { IRoleModel } from '../../../../lib/rbac/models';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IIdentity } from '../../..';

export class RemoveRoleMutation implements IMutation<IMutationResponse> {
    constructor(public identity: IIdentity,
                private _RoleModel: IRoleModel,
                private _UserModel: any) {}

    run(data: any): Promise<IMutationResponse> {

        return new Promise<IMutationResponse>((resolve, reject) => {
            let promises = [];
            let d = this._UserModel.find({ roles: { $in: [data.id] } })
                .populate('roles', '-_id, name')
                .then((role) => {
                    return role;
                });
            promises.push(d);

            return Promise.all(promises).then((roleExist) => {
                return this._RoleModel.removeRole(data.id, roleExist[0]).then((r) => {
                    return resolve({ success: true, entity: r});
                }).catch((err) => {
                    return resolve({ success: false, entity: err.entity, errors: [ { field: 'role', errors: [err.errors[0].errors] } ]});
                });
            });
        });

    }
}
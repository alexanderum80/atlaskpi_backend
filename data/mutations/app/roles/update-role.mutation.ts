import { IMutationResponse } from '../../../models/common';
import { IMutation } from '../..';
import { IRoleModel } from '../../../../lib/rbac/models';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IIdentity } from '../../..';

export class UpdateRoleMutation implements IMutation<IMutationResponse> {
    constructor(public identity: IIdentity,
                private _RoleModel: IRoleModel) {}

    run(data: any): Promise<IMutationResponse> {

        return new Promise<IMutationResponse>((resolve, reject) => {
            return this._RoleModel.updateRole(data.id, data.data).then((response) => {
                return resolve({ success: true, entity: response });
            }).catch((err) => {
                return resolve({ success: false, errors: [ { field: 'role', errors: [err] } ]});
            });
        });
    }
}
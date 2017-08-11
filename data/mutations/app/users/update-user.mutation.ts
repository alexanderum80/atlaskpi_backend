import { IRoleModel } from '../../../../lib/rbac/models';
import * as Promise from 'bluebird';
import { IIdentity, IMutationResponse, ICreateUserDetails, IUserModel, IUserDocument } from '../../..';
import { IMutation, IValidationResult } from '../..';

export class UpdateUserMutation implements IMutation<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _UserModel: IUserModel,
                private _RoleModel: IRoleModel) { }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        const that = this;
        return this._RoleModel.findAllRoles('')
            .then((resp) => {
                return this._UserModel.updateUser(data.id, data.data, resp );
            });
    }
}

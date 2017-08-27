import { IRoleModel } from '../../../../lib/rbac/models';
import { MutationBase } from '../../mutation-base';
import * as Promise from 'bluebird';
import { IIdentity, IMutationResponse, ICreateUserDetails, IUserModel, IUserDocument } from '../../..';
import { IMutation, IValidationResult } from '../..';

export class UpdateUserMutation extends MutationBase<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _UserModel: IUserModel,
        private _RoleModel: IRoleModel) {
                    super(identity);
                }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        const that = this;

       return this._RoleModel.findAllRoles('')
        .then((resp) => {
            return Promise.all(resp)
                .then((r) => {
                    return this._UserModel.updateUser(data.id, data.data, r);
                });
        });
    }
}

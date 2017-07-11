import * as Promise from 'bluebird';
import { IIdentity, IMutationResponse, ICreateUserDetails, IUserModel, IUserDocument } from '../../..';
import { IMutation, IValidationResult } from '../..';

export class UpdateUserMutation implements IMutation<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _UserModel: IUserModel) { }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        return this._UserModel.updateUser(data.id, data.data);
    }
}

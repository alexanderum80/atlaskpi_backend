import { MutationBase } from '../../mutation-base';
import * as Promise from 'bluebird';
import { IIdentity, IMutationResponse, ICreateUserDetails, IUserModel, IUserDocument } from '../../..';
import { IMutation, IValidationResult } from '../..';

export class UpdateUserMutation extends MutationBase<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _UserModel: IUserModel) {
                    super(identity);
                }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        return this._UserModel.updateUser(data.id, data.data);
    }
}

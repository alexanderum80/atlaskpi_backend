import { IUserModel } from '../../../models/app/users';
import * as Promise from 'bluebird';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import { IAppConfig } from '../../../../configuration';

export class RemoveUserMutation implements IMutation<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _UserModel: IUserModel) { }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        return this._UserModel.removeUser(data.id);
    }
}

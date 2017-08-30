import { IMobileDevice, IUserDocument } from '../../../models/app/users/IUser';
import { MutationBase } from '../../mutation-base';
import { IUserModel } from '../../../models/app/users';
import * as Promise from 'bluebird';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import { IAppConfig } from '../../../../configuration';

export class AddMobileDeviceMutation extends MutationBase<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _user: IUserDocument,
                private _UserModel: IUserModel) {
                    super(identity);
                }

    run(data: IMobileDevice): Promise<IMutationResponse> {
        return this._UserModel.addMobileDevice(this._user._id, data);
    }
}

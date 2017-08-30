import { MutationBase } from '../../mutation-base';
import { IUserModel } from '../../../models/app/users';
import * as Promise from 'bluebird';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import { IAppConfig } from '../../../../configuration';

export class RemoveMobileDeviceMutation extends MutationBase<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _UserModel: IUserModel) {
                    super(identity);
                }

    run(data: { network: string, deviceToken: string }): Promise<IMutationResponse> {
        return this._UserModel.removeMobileDevice(data.network, data.deviceToken);
    }
}

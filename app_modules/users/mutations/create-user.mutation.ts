import { MutationBase } from '../../mutation-base';
import { IEmailNotifier } from '../../../../services/notifications';
import { ICreateUserDetails, IUserModel, IUserDocument, IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import { AccountCreatedNotification } from '../../../../services';
import { IAppConfig } from '../../../../configuration';

export class CreateUserMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _notifier: IEmailNotifier,
        private _UserModel: IUserModel) {
            super(identity);
        }

    run(data: ICreateUserDetails): Promise<IMutationResponse> {
        return this._UserModel.createUser(data, this._notifier);
    }
}

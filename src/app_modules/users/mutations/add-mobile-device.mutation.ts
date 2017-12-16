import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IMobileDevice, IUserDocument } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { AddDeviceTokenActivity } from '../activities/add-device-token.activity';
import { AddMobileDeviceDetails } from '../users.types';

@injectable()
@mutation({
    name: 'addMobileDevice',
    activity: AddDeviceTokenActivity,
    parameters: [
        { name: 'details', type: AddMobileDeviceDetails, required: true },
    ],
    output: { type: Boolean }
})
export class AddMobileDeviceMutation extends MutationBase<Boolean> {
    constructor(
        @inject(CurrentUser.name) private _currentUser: IUserDocument,
        @inject(Users.name) private _users: Users
    ) {
        super();
    }

    run(data: IMobileDevice): Promise<Boolean> {
        return this._users.model.addMobileDevice(this._currentUser._id, data);
    }
}

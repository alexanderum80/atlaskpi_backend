import { IMobileDevice, IUserDocument } from '../../../domain/app/security/users';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { MutationBase, mutation } from '../../../framework';
import { Users } from '../../../domain';
import { AddMobileDeviceDetails } from '../users.types';
import { AddDeviceTokenActivity } from '../activities';

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
        @inject('CurrentUser') private _currentUser: IUserDocument,
        @inject('Users') private _users: Users
    ) {
        super();
    }

    run(data: IMobileDevice): Promise<Boolean> {
        return this._users.model.addMobileDevice(this._currentUser._id, data);
    }
}

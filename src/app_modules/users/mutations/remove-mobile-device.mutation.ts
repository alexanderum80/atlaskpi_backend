import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Users } from '../../../domain/app/security/users/user.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { RemoveDeviceTokenActivity } from '../activities/remove-device-token.activity';

@injectable()
@mutation({
    name: 'removeMobileDevice',
    activity: RemoveDeviceTokenActivity,
    parameters: [
        { name: 'network', type: String, required: true },
        { name: 'token', type: String, required: true },
    ],
    output: { type: Boolean }
})
export class RemoveMobileDeviceMutation extends MutationBase<Boolean> {
    constructor(@inject(Users.name) private _users: Users) {
        super();
    }

    run(data: { network: string, token: string,  }): Promise<Boolean> {
        return this._users.model.removeMobileDevice(data.network, data.token);
    }
}

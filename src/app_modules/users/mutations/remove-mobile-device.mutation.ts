
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { MutationBase, mutation } from '../../../framework';
import { Users } from '../../../domain';
import { RemoveDeviceTokenActivity } from '../activities';

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
    constructor(@inject('Users') private _users: Users) {
        super();
    }

    run(data: { network: string, token: string,  }): Promise<Boolean> {
        return this._users.model.removeMobileDevice(data.network, data.token);
    }
}

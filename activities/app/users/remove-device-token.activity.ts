import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const removeDeviceTokenActivity: IActivity = {
    may: 'remove-device-token',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
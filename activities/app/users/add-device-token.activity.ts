import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const addDeviceTokenActivity: IActivity = {
    may: 'add-device-token',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
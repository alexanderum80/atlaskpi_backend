import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const updateUserActivity: IActivity = {
    may: 'update-user',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
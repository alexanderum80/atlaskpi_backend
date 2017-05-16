import { IIdentity } from '../../data';
import { IActivity } from '../../lib/enforcer';

export const getAccountActivity: IActivity = {
    may: 'get-account',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
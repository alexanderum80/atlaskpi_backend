import { IIdentity } from '../../data';
import { IActivity } from '../../lib/enforcer';

export const createAccountActivity: IActivity = {
    may: 'create-account',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
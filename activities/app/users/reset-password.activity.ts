import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const resetPasswordActivity: IActivity = {
    may: 'reset-password',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
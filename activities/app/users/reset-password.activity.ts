import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const resetPasswordActivity: IActivity = {
    may: 'reset-password',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const userForgotPasswordActivity: IActivity = {
    may: 'user-forgot-password',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};


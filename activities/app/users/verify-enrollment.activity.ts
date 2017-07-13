import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const verifyEnrollmentActivity: IActivity = {
    may: 'verify-enrollment',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};

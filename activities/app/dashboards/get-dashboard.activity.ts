import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getDashboardActivity: IActivity = {
    may: 'get-dashboard',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
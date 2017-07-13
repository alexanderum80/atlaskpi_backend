import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getDashboardActivity: IActivity = {
    may: 'get-dashboard',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getDashboardsActivity: IActivity = {
    may: 'get-dashboards',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
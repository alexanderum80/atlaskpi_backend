import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getAllKPIsActivity: IActivity = {
    may: 'get-all-kpis',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
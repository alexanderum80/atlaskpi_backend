import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getKpisActivity: IActivity = {
    may: 'get-kpis',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
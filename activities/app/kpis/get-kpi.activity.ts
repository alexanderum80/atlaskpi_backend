import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getKpiActivity: IActivity = {
    may: 'get-kpi',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};

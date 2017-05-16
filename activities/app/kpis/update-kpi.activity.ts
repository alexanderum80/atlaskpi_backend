import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const updateKPIActivity: IActivity = {
    may: 'update-kpi',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const removeKPIActivity: IActivity = {
    may: 'remove-kpi',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
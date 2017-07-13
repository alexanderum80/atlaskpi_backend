import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const removeKPIActivity: IActivity = {
    may: 'remove-kpi',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
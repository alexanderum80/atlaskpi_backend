import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const updateKPIActivity: IActivity = {
    may: 'update-kpi',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
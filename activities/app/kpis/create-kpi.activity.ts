import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const createKPIActivity: IActivity = {
    may: 'create-kpi',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
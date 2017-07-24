import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const searchActivity: IActivity = {
    may: 'search',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
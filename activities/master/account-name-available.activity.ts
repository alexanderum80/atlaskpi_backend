import { IIdentity } from '../../data';
import { IActivity } from '../../lib/enforcer';

export const accountNameAvailableActivity: IActivity = {
    may: 'account-name-available',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
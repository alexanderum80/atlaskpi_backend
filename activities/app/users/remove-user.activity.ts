import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const removeUserActivity: IActivity = {
    may: 'remove-user',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
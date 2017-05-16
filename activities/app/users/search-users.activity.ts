import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const searchUsersActivity: IActivity = {
    may: 'search-users',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
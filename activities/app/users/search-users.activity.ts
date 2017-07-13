import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const searchUsersActivity: IActivity = {
    may: 'search-users',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
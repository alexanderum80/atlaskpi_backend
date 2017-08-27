import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const findAllUsersActivity: IActivity = {
    may: 'find-all-users',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
}
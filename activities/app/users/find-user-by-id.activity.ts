import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const findUserByIdActivity: IActivity = {
    may: 'find-user-by-id',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
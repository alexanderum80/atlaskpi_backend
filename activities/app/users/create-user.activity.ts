import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const createUserActivity: IActivity = {
    may: 'create-user',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
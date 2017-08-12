import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const updateUserActivity: IActivity = {
    may: 'update-user',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        let d;
        let roles = identity.roles;
        if (roles.indexOf('admin') === -1) {
            d = Promise.resolve(false);
        }
        else {
            d = Promise.resolve(true);
        }
        cb(null, d);
    }
};
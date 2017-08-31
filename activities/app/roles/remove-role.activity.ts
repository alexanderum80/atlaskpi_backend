import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const removeRoleActivity: IActivity = {
    may: 'remove-role',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        let d = true;
        let roles = identity.roles;
        if (roles.indexOf('admin') === -1) {
            d = false;
        }
        cb(null, d);
    }
};
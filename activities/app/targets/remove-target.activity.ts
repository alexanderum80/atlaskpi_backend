import { IIdentity } from '../../../data/models/app/identity';
import { IActivity } from '../../../lib/enforcer';

export const deleteTargetActivity: IActivity = {
    may: 'remove-target',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        let d = true;
        let roles = identity.roles;
        if (roles.indexOf('admin') === -1) {
            d = false;
        }
        cb(null, d);
    }
}
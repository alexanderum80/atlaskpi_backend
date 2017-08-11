import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const removeUserActivity: IActivity = {
    may: 'remove-user',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        let d = true;
        identity.roles.forEach((r) => {
            if (r !== 'admin') {
                d = false;
            }
        });
        cb(null, d);
    }
};
import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const updateUserActivity: IActivity = {
    may: 'update-user',
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
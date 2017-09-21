import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const updateUserActivity: IActivity = {
    may: 'update-user',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        let d;
        let roles = request.identity.roles;
        if (roles.indexOf('admin') === -1) {
            d = Promise.resolve(false);
        }
        else {
            d = Promise.resolve(true);
        }
        cb(null, d);
    }
};
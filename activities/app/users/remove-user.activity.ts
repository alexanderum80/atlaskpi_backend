import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const removeUserActivity: IActivity = {
    may: 'remove-user',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        let d = true;
        let roles = request.identity.roles;
        if (roles.indexOf('admin') === -1) {
            d = false;
        }
        cb(null, d);
    }
};
import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const removeRoleActivity: IActivity = {
    may: 'remove-role',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        let d = true;
        let roles = request.identity.roles;
        if (roles.indexOf('admin') === -1) {
            d = false;
        }
        cb(null, d);
    }
};
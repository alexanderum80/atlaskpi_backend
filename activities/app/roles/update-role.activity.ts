import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const updateRoleActivity: IActivity = {
    may: 'update-role',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        let d = true;
        let roles = request.identity.roles;
        if (roles.indexOf('admin') === -1) {
            d = false;
        }
        cb(null, d);
    }
};
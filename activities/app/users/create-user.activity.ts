import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const createUserActivity: IActivity = {
    may: 'create-user',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        let d = true;
        let roles = request.identity.roles;
        if (roles.indexOf('admin') === -1) {
            d = false;
        }
        cb(null, d);
    }
};
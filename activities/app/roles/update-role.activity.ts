import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const updateRoleActivity: IActivity = {
    may: 'update-role',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        let checkRole = request.user.roles.find((role) => role.name === 'admin');
        let hasPermission = checkRole ? true : false;

        cb(null, hasPermission);
    }
};
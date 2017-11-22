import { BasicRoleChecker } from '../basic-role-checker';
import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const createRoleActivity: IActivity = {
    may: 'create-role',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, BasicRoleChecker.hasPermission(request.user, 'Manage Access Levels', 'Users'));
    }
};
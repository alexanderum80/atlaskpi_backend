import { BasicRoleChecker } from '../basic-role-checker';
import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const findAllRolesActivity: IActivity = {
    may: 'find-all-roles',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, BasicRoleChecker.isAdmin(request.user));
    }
};

import { BasicRoleChecker } from '../basic-role-checker';
import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const removeRoleActivity: IActivity = {
    may: 'remove-role',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        const findAdmin = request.user.roles.find(role => {
            console.log(role._id);
            return (role.name === 'admin') && (role._id.toString() === request.body.variables.id);
        });
        const isAdmin = findAdmin === undefined ? BasicRoleChecker.hasPermission(request.user, 'Manage Access Levels', 'Users') : false;
        cb(null, isAdmin);
    }
};
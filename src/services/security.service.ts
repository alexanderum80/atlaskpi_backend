import { IUser } from './../domain/app/security/users/user';
import { IPermission } from '../framework/modules/security/permission';

export class BasicRoleChecker {
    public static hasPermission(user: any, action: string, subject: string): boolean {
        const currentUser = user._user as IUser;

        if (!currentUser) { return false; }
        if (!currentUser.roles || !currentUser.roles.length) { return false; }

        const allUserPermissions = Array.from(new Set<IPermission>([].concat(...currentUser.roles.map(r => r.permissions))));

        const found = allUserPermissions.find(p => p.action === action && p.subject === subject);

        if (!found) {
            console.log('!!!Permission not found... TODO: let the UI know....');
            return false;
        }

        return true;
    }
}

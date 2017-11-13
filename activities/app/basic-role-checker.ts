import { IIdentity } from '../../data';
import { IActivity } from '../../lib/enforcer';
import * as _ from 'lodash';

export class BasicRoleChecker {
    public static hasPermission(user: any, action: string, subject: string) {
        if (!user) { return false; }
        const isAllowed = user.roles.find(role => {
            return role.permissions.find(perm => {
                return (perm.action === action) && (perm.subject === subject);
            });
        });

        return isAllowed !== undefined;
    }
}

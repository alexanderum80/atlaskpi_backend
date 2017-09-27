import { IIdentity } from '../../data';
import { IActivity } from '../../lib/enforcer';
import * as _ from 'lodash';

export class BasicRoleChecker {
    public static  isAdmin(user: any) {
        const isAdmin = user.roles.find(r => r.name === 'admin');
        return isAdmin !== undefined;
    }
}

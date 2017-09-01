import { IIdentity } from '../../data';
import { IActivity } from '../../lib/enforcer';
import * as _ from 'lodash';

export class BasicRoleChecker {
    public static  isAdmin(identity: IIdentity) {
        const isAdmin = identity.roles.find(r => r === 'admin');
        return isAdmin !== undefined;
    }
}

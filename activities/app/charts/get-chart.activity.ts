import { BasicRoleChecker } from '../basic-role-checker';
import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getChartActivity: IActivity = {
    may: 'get-chart',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, BasicRoleChecker.isAdmin(identity));
    }
};

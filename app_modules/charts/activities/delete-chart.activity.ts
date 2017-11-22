import { BasicRoleChecker } from '../basic-role-checker';
import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const deleteChartActivity: IActivity = {
    may: 'delete-chart',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, BasicRoleChecker.hasPermission(request.user, 'Delete Company Wide', 'Chart'));
    }
};

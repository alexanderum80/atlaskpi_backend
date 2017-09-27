import { BasicRoleChecker } from '../basic-role-checker';
import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const updateChartActivity: IActivity = {
    may: 'update-chart',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, BasicRoleChecker.isAdmin(request.user));
    }
};

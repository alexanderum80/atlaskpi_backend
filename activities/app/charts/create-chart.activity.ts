import { BasicRoleChecker } from '../basic-role-checker';
import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const createChartActivity: IActivity = {
    may: 'create-chart',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};

import { BasicRoleChecker } from '../basic-role-checker';
import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const updateKPIActivity: IActivity = {
    may: 'update-kpi',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, BasicRoleChecker.hasPermission(request.user, 'Edit', 'KPI'));
    }
};
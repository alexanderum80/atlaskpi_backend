import { BasicRoleChecker } from '../basic-role-checker';
import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const endOfDayReportActivity: IActivity = {
    may: 'end-of-day-report',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};

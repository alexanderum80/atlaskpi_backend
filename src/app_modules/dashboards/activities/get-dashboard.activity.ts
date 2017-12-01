import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const getDashboardActivity: IActivity = {
    may: 'get-dashboard',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
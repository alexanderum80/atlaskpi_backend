import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';
export const getAllAccessLogsActivity: IActivity = {
    may: 'get-all-access-logs',
    when(request: ExtendedRequest, cb: (err: any, authorized) => void) {
        cb(null, true);
    }
};

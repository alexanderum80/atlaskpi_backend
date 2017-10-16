import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';
export const getUsersLogActivity: IActivity = {
    may: 'get-users-log',
    when(request: ExtendedRequest, cb: (err: any, authorized) => void) {
        cb(null, true);
    }
}
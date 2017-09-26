import { ExtendedRequest } from '../../middlewares/extended-request';
import { IActivity } from '../../lib/enforcer';

export const getAccountActivity: IActivity = {
    may: 'get-account',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const createAccessLogActivity: IActivity = {
    may: 'create-access-log',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(cb, null);
    }
}
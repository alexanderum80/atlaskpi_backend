import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const findTargetActivity: IActivity = {
    may: 'find-target',
    when(request: ExtendedRequest, cb:(err: any, authorized: boolean) => void) {
        cb(null, true);
    }
}
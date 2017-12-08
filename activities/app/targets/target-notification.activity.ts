import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const targetNotificationActivity: IActivity = {
    may: 'target-notification',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
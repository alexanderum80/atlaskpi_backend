import { ExtendedRequest } from '../../middlewares/extended-request';
import { IActivity } from '../../lib/enforcer';

export const accountNameAvailableActivity: IActivity = {
    may: 'account-name-available',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
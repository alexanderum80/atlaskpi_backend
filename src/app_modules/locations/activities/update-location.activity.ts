import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const updateLocationActivity: IActivity = {
    may: 'update-location',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
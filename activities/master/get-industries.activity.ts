import { ExtendedRequest } from '../../middlewares/extended-request';
import { IActivity } from '../../lib/enforcer';

export const getIndustriesActivity: IActivity = {
    may: 'get-industries',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
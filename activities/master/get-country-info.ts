import { ExtendedRequest } from '../../middlewares/extended-request';
import { IActivity } from '../../lib/enforcer';

export const getCountryInfo: IActivity = {
    may: 'get-country-info',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
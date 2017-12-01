import { ExtendedRequest } from '../../../middlewares';
import { IActivity } from '../../../lib/enforcer';

export const updateBusinessUnitActivity: IActivity = {
    may: 'update-business-unit',
    when(identity: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
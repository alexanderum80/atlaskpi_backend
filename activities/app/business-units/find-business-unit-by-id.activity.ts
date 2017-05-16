import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const findBusinessUnitByIdActivity: IActivity = {
    may: 'find-business-unit-by-id',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};

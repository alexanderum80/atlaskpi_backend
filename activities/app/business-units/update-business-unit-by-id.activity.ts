import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const updateBusinessUnitByIdActivity: IActivity = {
    may: 'update-business-unit-by-id',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
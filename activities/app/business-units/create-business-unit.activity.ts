import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const createBusinessUnitActivity: IActivity = {
    may: 'create-business-unit',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
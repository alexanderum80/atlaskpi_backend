import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const listAllBusinessUnitsActivity: IActivity = {
    may: 'list-all-business-units',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
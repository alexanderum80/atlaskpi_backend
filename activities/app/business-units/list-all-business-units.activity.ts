import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const listAllBusinessUnitsActivity: IActivity = {
    may: 'list-all-business-units',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
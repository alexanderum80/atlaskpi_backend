import { IIdentity } from '../../data';
import { IActivity } from '../../lib/enforcer';

export const getIndustriesActivity: IActivity = {
    may: 'get-industries',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
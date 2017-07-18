import { IIdentity } from '../../data';
import { IActivity } from '../../lib/enforcer';

export const getIndustriesActivity: IActivity = {
    may: 'get-industries',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
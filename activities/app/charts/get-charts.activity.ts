import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getChartsActivity: IActivity = {
    may: 'get-charts',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
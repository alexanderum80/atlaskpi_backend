import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getChartActivity: IActivity = {
    may: 'get-chart',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
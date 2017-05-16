import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getChartDataActivity: IActivity = {
    may: 'get-chart-data',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
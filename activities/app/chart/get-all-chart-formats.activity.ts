import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getAllChartFormatsActivity: IActivity = {
    may: 'get-all-chart-formats',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
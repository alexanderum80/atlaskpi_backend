import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getAllChartFormatsActivity: IActivity = {
    may: 'get-all-chart-formats',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
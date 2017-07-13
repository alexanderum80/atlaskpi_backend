import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getChartFormatByIdActivity: IActivity = {
    may: 'get-chart-format-by-id',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
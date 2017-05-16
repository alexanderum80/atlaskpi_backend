import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const createChartFormatActivity: IActivity = {
    may: 'create-chart-format',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
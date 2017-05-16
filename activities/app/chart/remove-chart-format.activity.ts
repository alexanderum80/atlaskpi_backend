import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const removeChartFormatActivity: IActivity = {
    may: 'remove-chart-format',
    when(identity: IIdentity, cb: (err: any, authorized: Boolean) => void) {
        cb(null, true);
    }
};
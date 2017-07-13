import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const updateChartFormatActivity: IActivity = {
    may: 'update-chart-format',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
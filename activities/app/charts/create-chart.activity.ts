import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const createChartActivity: IActivity = {
    may: 'create-chart',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};

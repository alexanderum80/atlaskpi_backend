import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const deleteChartActivity: IActivity = {
    may: 'delete-chart',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};

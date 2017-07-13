import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getChartDataActivity: IActivity = {
    may: 'get-chart-data',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};


// This is part of the dynamic code, DO NOT DELETE, KEEP IT FOR LATER
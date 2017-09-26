import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const getChartDataActivity: IActivity = {
    may: 'get-chart-data',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};


// This is part of the dynamic code, DO NOT DELETE, KEEP IT FOR LATER
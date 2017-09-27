import { ExtendedRequest } from './../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const getKpiActivity: IActivity = {
    may: 'get-kpi',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};

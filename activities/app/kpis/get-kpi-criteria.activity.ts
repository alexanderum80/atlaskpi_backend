import { ExtendedRequest } from './../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const getKpiCriteriaActivity: IActivity = {
    may: 'get-kpi-criteria',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};

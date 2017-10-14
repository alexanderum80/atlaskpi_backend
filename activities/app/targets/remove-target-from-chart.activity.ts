import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer/index';

export const RemoveTargetFromChartActivity: IActivity = {
    may: 'remove-target-from-chart',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
}
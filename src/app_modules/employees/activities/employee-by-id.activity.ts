import { ExtendedRequest } from '../../../middlewares';
import { IActivity } from '../../../lib/enforcer';

export const employeeByIdActivity: IActivity = {
    may: 'employee-by-id',
    when(identity: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
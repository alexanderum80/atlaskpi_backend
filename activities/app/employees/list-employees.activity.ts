import { ExtendedRequest } from '../../../middlewares';
import { IActivity } from '../../../lib/enforcer';

export const listEmployeesActivity: IActivity = {
    may: 'list-employees',
    when(identity: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
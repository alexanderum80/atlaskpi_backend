import { ExtendedRequest } from '../../../middlewares';
import { IActivity } from '../../../lib/enforcer';

export const listDepartmentsActivity: IActivity = {
    may: 'list-departments',
    when(identity: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
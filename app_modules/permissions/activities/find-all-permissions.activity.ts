import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const findAllPermissionsActivity: IActivity = {
    may: 'find-all-permissions',
    when(request: ExtendedRequest, cb: (error: any, authrized: boolean) => void) {
        cb(null, true);
    }
}
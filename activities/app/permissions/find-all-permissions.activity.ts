import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const findAllPermissionsActivity: IActivity = {
    may: 'find-all-permissions',
    when(identity: IIdentity, cb: (error: any, authrized: boolean) => void) {
        cb(null, true);
    }
}
import { IIdentity } from '../../../data/models/app/identity';
import { IActivity } from '../../../lib/enforcer';

export const updateTargetActivity: IActivity = {
    may: 'update-target',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
}
import { IIdentity } from '../../../data/models/app/identity';
import { IActivity } from '../../../lib/enforcer';

export const deleteTargetActivity: IActivity = {
    may: 'remove-target',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
}
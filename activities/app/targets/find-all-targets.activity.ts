import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const findAllTargetsActivity: IActivity = {
    may: 'find-all-targets',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
}
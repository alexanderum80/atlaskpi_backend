import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const findTargetActivity: IActivity = {
    may: 'find-target',
    when(identity: IIdentity, cb:(err: any, authorized: boolean) => void) {
        cb(null, true);
    }
}
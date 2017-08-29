import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const createTargetActivity: IActivity = {
    may: 'create-target',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
}
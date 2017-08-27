import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const createAccessLogActivity: IActivity = {
    may: 'create-access-log',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(cb, null);
    }
}
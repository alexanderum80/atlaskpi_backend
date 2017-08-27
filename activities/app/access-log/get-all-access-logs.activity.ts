import { IIdentity } from '../../../data/models/app/identity';
import { IActivity } from '../../../lib/enforcer';
export const getAllAccessLogsActivity: IActivity = {
    may: 'get-all-access-logs',
    when(identity: IIdentity, cb: (err: any, authorized) => void) {
        cb(null, true);
    }
}
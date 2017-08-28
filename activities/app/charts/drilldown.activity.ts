import { IIdentity } from '../../../data/models/app/identity';
import { IActivity } from '../../../lib/enforcer';
export const drilldownActivity: IActivity = {
    may: 'drill-down',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
}
import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const listChartsActivity: IActivity = {
    may: 'list-charts',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
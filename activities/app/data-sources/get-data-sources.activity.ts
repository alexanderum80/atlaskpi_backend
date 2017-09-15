import { IIdentity } from '../../../data';
import { IActivity } from '../../../lib/enforcer';

export const getDataSourcesActivity: IActivity = {
    may: 'get-data-sources',
    when(identity: IIdentity, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};

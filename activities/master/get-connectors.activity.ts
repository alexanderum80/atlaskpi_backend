import { ExtendedRequest } from '../../middlewares/extended-request';
import { IActivity } from '../../lib/enforcer';

export const getConnectorsActivity: IActivity = {
    may: 'get-connectors',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};

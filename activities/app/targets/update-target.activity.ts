import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const updateTargetActivity: IActivity = {
    may: 'update-target',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        const checkAllowed = request.body.variables.data.owner === request.identity.username;
        cb(null, checkAllowed);
    }
};
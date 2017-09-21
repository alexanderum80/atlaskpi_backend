import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const deleteTargetActivity: IActivity = {
    may: 'remove-target',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        const checkAllowed = request.body.variables.owner === request.identity.username;
        cb(null, checkAllowed);
    }
};
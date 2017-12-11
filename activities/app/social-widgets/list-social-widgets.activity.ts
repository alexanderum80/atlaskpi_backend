import { BasicRoleChecker } from './../basic-role-checker';
import { ExtendedRequest } from './../../../middlewares/extended-request';
import { IActivity } from './../../../lib/enforcer/activity';

export const listSocialWidgetsActivity: IActivity = {
    may: 'list-social-widgets',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};
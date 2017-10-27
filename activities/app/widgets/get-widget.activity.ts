import { BasicRoleChecker } from './../basic-role-checker';
import { ExtendedRequest } from './../../../middlewares/extended-request';
import { IActivity } from './../../../lib/enforcer/activity';

export const getWidgetActivity: IActivity = {
    may: 'get-widget',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, BasicRoleChecker.hasPermission(request.user, 'View', 'Widget'));
    }
};
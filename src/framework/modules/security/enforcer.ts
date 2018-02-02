import * as Promise from 'bluebird';

import { IActivity } from './activity';
import { IPermission } from './permission';

export interface IAuthorizationResult {
    err?: any;
    authorized?: boolean;
}

export interface IEnforcer {
    authorizationTo(activity: IActivity, roles: string[], permissions: IPermission[]): Promise<boolean>;
}

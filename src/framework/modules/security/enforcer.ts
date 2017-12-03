import { IPermission } from './permission';
import * as Promise from 'bluebird';
import { IActivity } from './activity';

export interface IAuthorizationResult {
    err?: any;
    authorized?: boolean;
}

export interface IEnforcer {
    authorizationTo(activity: IActivity, roles: string[], permissions: IPermission[]): Promise<boolean>;
}

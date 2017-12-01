import { Request } from 'Express';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as logger from 'winston';
import { IActivity } from '../../../authorization';
import { injectable } from 'inversify';
import { IExtendedRequest } from '../../../models';


export interface IAuthorizationResult {
    err?: any;
    authorized?: boolean;
}

export interface IEnforcer {
    authorizationTo(activity: IActivity, request: IExtendedRequest): Promise<boolean>;
}

@injectable()
export class Enforcer implements IEnforcer {

    constructor() { }

    authorizationTo(activity: IActivity, request: IExtendedRequest): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            logger.debug('Checking allow authorization');

            if (request && request.user && request.user.roles) {
                const findOwner = request.user.roles.find(role => role.name === 'owner');
                const checkOwner = findOwner !== undefined;

                if (checkOwner) {
                    return resolve(true);
                }
            }

            // TODO: Implement the allow and deny global

            logger.debug('Checking activity authorization');

            this._checkAuthorization(activity, request).then((authorized) => {
                resolve(authorized);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    private _checkAuthorization(activity: IActivity, request: IExtendedRequest): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {

            if (!activity) {
                throw new Error('Cannot check authorization of an empty activity');
            }

            // the when callback has priority over the permissions list
            if (!activity.when && activity.hasPermissions) {
                // check only permissions

                let hasPermission = true;

                activity.hasPermissions.forEach((permission) => {
                    let permissionFound = _.find((<any>request).user.permissions, {
                        subject: permission.subject,
                        action: permission.action,
                    });

                    if (!permissionFound) {
                        hasPermission = false;
                        return false;
                    }
                });

                if (!hasPermission) {
                    resolve(hasPermission);
                }
            }

            activity.when(request, (err, authorized) => {
                if (err) {
                    throw err;
                }

                resolve(authorized);
            });
        });
    }
}
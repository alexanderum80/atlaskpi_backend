import * as Promise from 'bluebird';
import { injectable } from 'inversify';
import { find } from 'lodash';
import * as logger from 'winston';

import { IActivity } from '../../../framework/modules/security/activity';
import { IEnforcer } from '../../../framework/modules/security/enforcer';
import { IPermission } from '../../../framework/modules/security/permission';

const OWNER = 'owner';

@injectable()
export class Enforcer implements IEnforcer {

    constructor() { }

    authorizationTo(activity: IActivity, roles: string[],  permissions: IPermission[]): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            logger.debug('Checking allow authorization');

            const isOwner = roles.findIndex(r => r === OWNER) !== -1;

            if (isOwner) {
                return resolve(true);
            }

            // TODO: Implement the allow and deny global

            logger.debug('Checking activity authorization');

            activity.check().then((authorized) => {
                resolve(authorized);
            }).catch((err) => {
                reject(err);
            });
        });
    }
}

// // TODO: FInish this
// function checkAuthorization(activity: IActivity, roles: string[], permissions: IPermission[]): Promise<boolean> {
//     if (!activity) {
//         throw new Error('Cannot check authorization of an empty activity');
//     }

//     return activity.check();
// }
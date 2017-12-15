// import { IActivity } from '../../../framework/modules/security/activity';
// import { IPermission } from '../../../framework/modules/security/permission';
// import { IEnforcer } from '../../../framework/modules/security/enforcer';
// import { Request } from 'Express';
// import * as Promise from 'bluebird';
// import * as logger from 'winston';
// import { injectable } from 'inversify';
// import { find } from 'lodash';

// const OWNER = 'owner';

// @injectable()
// export class Enforcer implements IEnforcer {

//     constructor() { }

//     authorizationTo(activity: IActivity, roles: string[],  permissions: IPermission[]): Promise<boolean> {
//         return new Promise<boolean>((resolve, reject) => {
//             logger.debug('Checking allow authorization');

//             const isOwner = roles.findIndex(r => r === OWNER) !== -1;

//             if (isOwner) {
//                 return resolve(true);
//             }

//             // TODO: Implement the allow and deny global

//             logger.debug('Checking activity authorization');

//             checkAuthorization(activity, roles, permissions).then((authorized) => {
//                 resolve(authorized);
//             }).catch((err) => {
//                 reject(err);
//             });
//         });
//     }
// }

// function checkAuthorization(activity: IActivity, roles: string[], permissions: IPermission[]): Promise<boolean> {
//     return new Promise<boolean>((resolve, reject) => {

//         if (!activity) {
//             throw new Error('Cannot check authorization of an empty activity');
//         }

//         // the when callback has priority over the permissions list
//         if (activity.hasPermissions && activity.hasPermissions.length > 0) {
//             // check only permissions

//             let hasPermission = true;

//             activity.hasPermissions.forEach((permission) => {
//                 let permissionFound = find(permissions, {
//                     subject: permission.subject,
//                     action: permission.action,
//                 });

//                 if (!permissionFound) {
//                     hasPermission = false;
//                     return false;
//                 }
//             });

//             if (!hasPermission) {
//                 return resolve(hasPermission);
//             }
//         }

//         activity.when(roles, permissions, (err, authorized) => {
//             if (err) {
//                 throw err;
//             }

//             resolve(authorized);
//         });
//     });
// }
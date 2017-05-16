// declare module 'mongoose-rbac' {

//     import * as mongoose from 'mongoose';

//     export interface PermissionDetails {
//         subject: string;
//         action: string;
//     }

//     export interface IPermissionDocument extends mongoose.Document {
//         subject: string;
//         action: string;
//         displayName: string;
//         description: string;
//     }

//     export interface IRoleDocument extends mongoose.Document {
//         name: string;
//         displayName: string;
//         description: string;
//         permissions: [mongoose.Schema.Types.ObjectId];
//     }

//     export class Permission { }
//     export class Role { }
//     export function init(options: any, cb: (err, ...roles) => void);

//     // export interface Permission extends mongoose.Model<IPermissionDocument> { }
    
// }

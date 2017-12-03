import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { IPermission } from '../../../../framework/modules/security/permission';

export interface IPermissionInfo {
    _id ?: string;
    action: string;
    subject: string;
}

export interface IPermissionDocument extends IPermission, mongoose.Document {}

export interface IPermissionModel extends mongoose.Model < IPermissionDocument > {
    findOrCreateOne(permission: IPermissionInfo): Promise < IPermissionDocument > ;
    getOrCreate(permissions: IPermissionInfo[] | IPermissionInfo): Promise < IPermissionDocument[] > ;
    findAllPermissions(filter: string): Promise < IPermissionInfo[] > ;
}
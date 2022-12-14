import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { IPermission } from '../../../../framework/modules/security/permission';
import { ISearchableModel } from '../../global-search/global-search';


export interface IRole {
    name: string;
    displayName: string;
    description: string;
    permissions: IPermission[];
}

export interface IRoleList {
    _id: string;
    name: string;
}

export interface IRoleCustom {
    name: string;
    permissions: [mongoose.Schema.Types.ObjectId];
}

export interface IRoleResponse {
    _id: string;
    name: string;
    permissions: any;
    roles?: any;
}

export interface IRoleDocument extends IRole, mongoose.Document {
    can(action: string, subject: string, done: (err: any, can: boolean) => void);
    canAll(actionsAndSubjects: any, done: (err: any, can: boolean) => void);
    canAny(actionsAndSubjects: any, done: (err: any, can: boolean) => void);
}

export interface IRoleModel extends mongoose.Model < IRoleDocument >, ISearchableModel {
    seedRoles(): Promise<boolean>;
    findAllRoles(filter: string): Promise<IRoleDocument[]>;
    roleByName(name: string): Promise<IRoleDocument>;
    createRole(data: IRoleCustom): Promise<IRoleDocument>;
    updateRole(id: string, data: IRoleResponse): Promise<IRoleDocument>;
    removeRole(id: string, roleExist: any[]): Promise<IRoleDocument>;
}

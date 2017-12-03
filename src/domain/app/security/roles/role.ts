import * as mongoose from 'mongoose';
import * as async from 'async';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';

export interface IRole {
    name: string;
    displayName: string;
    description: string;
    permissions: [mongoose.Schema.Types.ObjectId];
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

export interface IRoleModel extends mongoose.Model < IRoleDocument > {
    findAllRoles(filter: string): Promise<IRoleDocument[]>;
    createRole(data: IRoleCustom): Promise<IRoleDocument>;
    updateRole(id: string, data: IRoleResponse): Promise<IRoleDocument>;
    removeRole(id: string, roleExist: any[]): Promise<IRoleDocument>;
}

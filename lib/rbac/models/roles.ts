import { IUserEmail, IUserProfile } from '../../../data/models/app/users/index';
import { IUserModel } from '../../../data/models/app/users/IUser';
import { MutationResponse } from '../../../data/models/common';
import { IMutationResponse } from '../../../data/models/common';
import { IQueryResponse } from '../../../data/models/common';
import * as mongoose from 'mongoose';
import * as async from 'async';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';

import {
    doCan,
    CAN_ALL,
    CAN_ANY
} from './utils';

// INTERFACES 


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

export interface IUserRole {
    roles?: IRoleResponse;
    username: string;
    emails: IUserEmail[];
    profile: IUserProfile;
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


// SCHEMA


export const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    displayName: String,
    description: String,
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }],
    timestamp: { type: Date, default: Date.now }
});


// METHODS


RoleSchema.methods.can = function (action, subject, done) {
    this.model('Role').findById(this._id, function (err, role) {
        if (err) return done(err);
        doCan.call(role, CAN_ALL, [
            [action, subject]
        ], done);
    });
};

RoleSchema.methods.canAll = function (actionsAndSubjects, done) {
    this.model('Role').findById(this._id, function (err, role) {
        if (err) return done(err);
        doCan.call(role, CAN_ALL, actionsAndSubjects, done);
    });
};

RoleSchema.methods.canAny = function (actionsAndSubjects, done) {
    this.model('Role').findById(this._id, function (err, role) {
        if (err) return done(err);
        doCan.call(role, CAN_ANY, actionsAndSubjects, done);
    });
};

RoleSchema.pre('save', function (done) {
    let that = this;
    this.model('Role').findOne({
        name: that.name
    }, function (err, role) {
        if (err) {
            done(err);
        } else if (role && !(role._id.equals(that._id))) {
            that.invalidate('name', 'name must be unique');
            done(new Error('Role name must be unique'));
        } else {
            done();
        }
    });
});

RoleSchema.statics.createRole = function(data: IRoleCustom): Promise<IRoleDocument> {
    const that = this;
    return new Promise<IRoleDocument>((resolve, reject) => {

        let constraints = {
            name: { presence: { message: '^cannot be blank' }},
            permissions: { presence: { message: '^cannot be blank' }},
        };

        let errors = (<any>validate)((<any>data), constraints, {fullMessages: false});
        if (errors) {
            resolve(errors);
            return;
        };

        that.create(data, (err, role: IRoleDocument) => {
            if (err) {
                reject({ message: 'There was an error creating a role', error: err });
                return;
            }
            resolve(role);
        });
    });
};

RoleSchema.statics.updateRole = function(id: string, data: IRoleResponse): Promise<IRoleDocument> {
    const that = this;
    return new Promise<IRoleDocument>((resolve, reject) => {
        let roleError = (<any>validate)({ id: id}, {id: {presence: { message: 'cannot be blank'}}});

        if (roleError) {
            resolve(roleError);
            return;
        }

        (<IRoleModel>this).findById(id).then((role) => {
            let constraints = {
                name: { presence: {message: '^cannot be blank' }},
                permissions: { presence: { message: '^cannot be empty'}}
            };

            let errors = (<any>validate)(data, constraints, { fullMessages: false });
            if (errors) {
                resolve(errors);
                return;
            }

            role.permissions = null;
            role.name = data.name;
            role.permissions = data.permissions;

            role.save((err, role: IRoleDocument) => {
                if (err) {
                    reject({message: 'There was an error updating the role', error: err });
                    return;
                }
                resolve(role);
            });
        }).catch((err) => {
            resolve(err);
        });
    });
};

RoleSchema.statics.removeRole = function(id: string, roleExist: any[]): Promise<IRoleDocument> {
    const that = this;

    let document: IRoleDocument;

    return new Promise<IRoleDocument>((resolve, reject) => {
        let idError = (<any>validate)({id: id});
        if (idError) {
            resolve(idError);
        };

        if (roleExist && roleExist.length) {
            reject({ success: false, entity: roleExist, errors: [ { field: 'role', errors: ['Role is being used by'] } ]});
            return;
        }

        (<IRoleModel>this).findById(id).then((role) => {
            let constraints = {
                document: { presence: {messsage: '^not found'}}
            };

            let errors = (<any>validate)({id: id, document: role}, constraints, { fullMessages: false });
            if (errors) {
                resolve(errors);
            }

            let deleteRole = role;

            role.remove((err, role: IRoleDocument) => {
                if (err) {
                    reject({ message: 'There was an error removing the role', error: err });
                    return;
                }
                resolve(deleteRole);
            });
        }).catch((err) => {
            resolve(err);
        });
    });
};

RoleSchema.statics.findAllRoles = function(filter: string): Promise<IRoleDocument[]> {
    return new Promise<IRoleDocument[]>((resolve, reject) => {
        (<IRoleModel>this).find({ name: {$ne: 'owner'} })
            .then((roles) => {
                if (roles) {
                    resolve(roles);
                }
                else {
                    reject({ errors: [ {field: 'role', errors: ['Not found'] } ], data: null });
                }
            })
            .catch((err) => {
                reject({ errors: [ {field: 'role', errors: ['Not found'] } ], data: null });
            });
    });
};

export function getRoleModel(m: mongoose.Connection): IRoleModel {
    return <IRoleModel>m.model('Role', RoleSchema, 'roles');
}

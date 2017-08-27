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
}


export interface IRoleDocument extends IRole, mongoose.Document {
    can(action: string, subject: string, done: (err: any, can: boolean) => void);
    canAll(actionsAndSubjects: any, done: (err: any, can: boolean) => void);
    canAny(actionsAndSubjects: any, done: (err: any, can: boolean) => void);
    createRole(data: IRoleCustom): Promise<IMutationResponse>;
}

export interface IRoleModel extends mongoose.Model < IRoleDocument > {
    findAllRoles(filter: string): Promise<IRoleList[]>;
    createRole(data: IRoleCustom): Promise<IMutationResponse>;
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
    }]
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

RoleSchema.statics.createRole = function(data: IRoleCustom): Promise<IMutationResponse> {
    const that = this;
    return new Promise<IMutationResponse>((resolve, reject) => {

        let constraints = {
            name: { presence: { message: '^cannot be blank' }},
            permissions: { presence: { message: '^cannot be blank' }},
        };

        let errors = (<any>validate)((<any>data), constraints, {fullMessages: false});
        if (errors) {
            resolve(MutationResponse.fromValidationErrors(errors));
            return;
        };

        that.create(data, (err, role: IRoleCustom) => {
            if (err) {
                console.log(err);
                reject({ message: 'There was an error creating a role', error: err });
                return;
            }
            console.log(role);
            resolve({ entity: role });
        });
    });
};

RoleSchema.statics.findAllRoles = function(filter: string): Promise<IRoleList[]> {
    return new Promise<IRoleList[]>((resolve, reject) => {
        (<IRoleModel>this).find()
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

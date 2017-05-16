import * as mongoose from 'mongoose';
import * as async from 'async';
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

export interface IRoleDocument extends IRole, mongoose.Document {
    can(action: string, subject: string, done: (err: any, can: boolean) => void);
    canAll(actionsAndSubjects: any, done: (err: any, can: boolean) => void);
    canAny(actionsAndSubjects: any, done: (err: any, can: boolean) => void);
}

export interface IRoleModel extends mongoose.Model < IRoleDocument > {}


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

export function getRoleModel(m: mongoose.Connection): IRoleModel {
    return <IRoleModel>m.model('Role', RoleSchema, 'roles');
}
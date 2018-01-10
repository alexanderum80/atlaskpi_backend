import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as validate from 'validate.js';

import { field } from '../../../../framework/decorators/field.decorator';
import { ModelBase } from '../../../../type-mongo/model-base';
import { AppConnection } from '../../app.connection';
import { Permissions } from '../permissions/permission.model';
import { initRoles } from './init-roles';
import { initialRoles } from './initial-roles';
import { IRoleCustom, IRoleDocument, IRoleModel, IRoleResponse } from './role';
import { CAN_ALL, CAN_ANY, doCan } from './utils';

// INTERFACES


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
    timestamp: {
        type: Date,
        default: Date.now
    }
});


// METHODS


RoleSchema.methods.can = function(action, subject, done) {
    this.model('Role').findById(this._id, function(err, role) {
        if (err) return done(err);
        doCan.call(role, CAN_ALL, [
            [action, subject]
        ], done);
    });
};

RoleSchema.methods.canAll = function(actionsAndSubjects, done) {
    this.model('Role').findById(this._id, function(err, role) {
        if (err) return done(err);
        doCan.call(role, CAN_ALL, actionsAndSubjects, done);
    });
};

RoleSchema.methods.canAny = function(actionsAndSubjects, done) {
    this.model('Role').findById(this._id, function(err, role) {
        if (err) return done(err);
        doCan.call(role, CAN_ANY, actionsAndSubjects, done);
    });
};

RoleSchema.pre('save', function(done) {
    let that = this;
    this.model('Role').findOne({
        name: that.name
    }, function(err, role) {
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

RoleSchema.statics.seedRoles = function(roles: Roles, permissions: Permissions): Promise < boolean > {
    const that = this;
    return new Promise < boolean > ((resolve, reject) => {
        that.find({}).then((roles) => {
                initRoles(roles, permissions, initialRoles, roles).then(created => {
                        if (created)
                            resolve(true);
                    })
                    .catch(err => {
                        reject(err);
                    });
            })
            .catch(err => {
                reject(err);
            });
    });
}

RoleSchema.statics.createRole = function(data: IRoleCustom): Promise < IRoleDocument > {
    const that = this;
    return new Promise < IRoleDocument > ((resolve, reject) => {

        let constraints = {
            name: {
                presence: {
                    message: '^cannot be blank'
                }
            },
            permissions: {
                presence: {
                    message: '^cannot be blank'
                }
            },
        };

        let errors = ( < any > validate)(( < any > data), constraints, {
            fullMessages: false
        });

        if (errors) {
            resolve(errors);
            return;
        }

        that.create(data, (err, role: IRoleDocument) => {
            if (err) {
                reject({
                    message: 'There was an error creating a role',
                    error: err
                });
                return;
            }
            resolve(role);
        });
    });
};

RoleSchema.statics.updateRole = function(id: string, data: IRoleResponse): Promise < IRoleDocument > {
    const that = this;
    return new Promise < IRoleDocument > ((resolve, reject) => {
        let roleError = ( < any > validate)({
            id: id
        }, {
            id: {
                presence: {
                    message: 'cannot be blank'
                }
            }
        });

        if (roleError) {
            resolve(roleError);
            return;
        }

        ( < IRoleModel > this).findById(id).then((role) => {
            let constraints = {
                name: {
                    presence: {
                        message: '^cannot be blank'
                    }
                },
                permissions: {
                    presence: {
                        message: '^cannot be empty'
                    }
                }
            };

            let errors = ( < any > validate)(data, constraints, {
                fullMessages: false
            });
            if (errors) {
                resolve(errors);
                return;
            }

            role.permissions = null;
            role.name = data.name;
            role.permissions = data.permissions;

            role.save((err, role: IRoleDocument) => {
                if (err) {
                    reject({
                        message: 'There was an error updating the role',
                        error: err
                    });
                    return;
                }
                resolve(role);
            });
        }).catch((err) => {
            resolve(err);
        });
    });
};

RoleSchema.statics.removeRole = function(id: string, roleExist: any[]): Promise < IRoleDocument > {
    const that = this;

    let document: IRoleDocument;

    return new Promise < IRoleDocument > ((resolve, reject) => {
        let idError = ( < any > validate)({
            id: id
        });
        if (idError) {
            resolve(idError);
        }

        if (roleExist && roleExist.length) {
            reject({
                success: false,
                entity: roleExist,
                errors: ['Role is being used by']
            });
            return;
        }

        ( < IRoleModel > this).findById(id).then((role) => {
            let constraints = {
                document: {
                    presence: {
                        messsage: '^not found'
                    }
                }
            };

            let errors = ( < any > validate)({
                id: id,
                document: role
            }, constraints, {
                fullMessages: false
            });
            if (errors) {
                resolve(errors);
            }

            let deleteRole = role;

            role.remove((err, role: IRoleDocument) => {
                if (err) {
                    reject({
                        message: 'There was an error removing the role',
                        error: err
                    });
                    return;
                }
                resolve(deleteRole);
            });
        }).catch((err) => {
            resolve(err);
        });
    });
};

RoleSchema.statics.findAllRoles = function(filter: string): Promise < IRoleDocument[] > {
    return new Promise < IRoleDocument[] > ((resolve, reject) => {
        ( < IRoleModel > this).find({
                name: {
                    $ne: 'owner'
                }
            })
            .then((roles) => {
                if (roles) {
                    resolve(roles);
                } else {
                    reject({
                        errors: [{
                            field: 'role',
                            errors: ['Not found']
                        }],
                        data: null
                    });
                }
            })
            .catch((err) => {
                reject({
                    errors: [{
                        field: 'role',
                        errors: ['Not found']
                    }],
                    data: null
                });
            });
    });
};

@injectable()
export class Roles extends ModelBase < IRoleModel > {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Role', RoleSchema, 'roles');
    }
}
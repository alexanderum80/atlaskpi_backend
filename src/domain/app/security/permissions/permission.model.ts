import {
    ModelBase
} from '../../../../type-mongo';
import {
    AppConnection
} from '../../app.connection';
import {
    injectable,
    inject
} from 'inversify';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import {
    IPermissionInfo,
    IPermissionDocument,
    IPermissionModel
} from './index';

export const PermissionSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    displayName: String,
    description: String
});

PermissionSchema.statics.findOrCreateOne = function(params: IPermissionInfo): Promise < IPermissionDocument > {
    const that = this;

    return new Promise < IPermissionDocument > ((resolve, reject) => {
        that.findOne(params, function(err, permission) {
            if (err) return reject(err);
            if (permission) return resolve(permission);
            that.create(params, (err, perm: IPermissionDocument) => {
                if (err) {
                    return reject(err);
                }
                resolve(perm);
            });

        });
    });
};

PermissionSchema.statics.getOrCreate = function(permissions: IPermissionInfo[] | IPermissionInfo): Promise < IPermissionDocument[] > {
    let that = this;

    if (!Array.isArray(permissions)) {
        permissions = [permissions];
    }

    return new Promise < IPermissionDocument[] > ((resolve, reject) => {
        const permissionPromises = [];

        ( < IPermissionInfo[] > permissions).forEach(p => {
            permissionPromises.push(that.findOrCreateOne(p));
        });

        Promise.all(permissionPromises).then(values => {
                return resolve(values);
            })
            .catch(err => {
                return reject(err);
            });

    });

};

PermissionSchema.statics.findAllPermissions = function(filter: string): Promise < IPermissionInfo[] > {
    return new Promise < IPermissionInfo[] > ((resolve, reject) => {
        ( < IPermissionModel > this).find()
            .then((permissions) => {
                if (permissions) {
                    resolve( < any > permissions);
                } else {
                    reject({
                        errors: [{
                            field: 'permission',
                            errors: ['Not found']
                        }],
                        data: null
                    });
                }
            })
            .catch((err) => {
                reject({
                    errors: [{
                        field: 'permission',
                        errors: ['Not found']
                    }],
                    data: null
                });
            });
    });
};

@injectable()
export class Permissions extends ModelBase < IPermissionModel > {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Permission', PermissionSchema, 'permissions');
    }
}
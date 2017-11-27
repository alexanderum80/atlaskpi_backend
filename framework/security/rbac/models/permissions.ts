import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { IQueryResponse } from '../../../data/models/common';
import * as _ from 'lodash';

export interface IPermission {
    subject: String;
    action: String;
    displayName?: String;
    description?: String;
}

export interface IPermissionInfo {
  _id?: string;
  action: string;
  subject: string;
}

export interface IPermissionDocument extends IPermission, mongoose.Document {}

export interface IPermissionModel extends mongoose.Model<IPermissionDocument> {
  findOrCreateOne(permission: IPermissionInfo): Promise<IPermissionDocument>;
  getOrCreate(permissions: IPermissionInfo[] | IPermissionInfo): Promise<IPermissionDocument[]>;
  findAllPermissions(filter: string): Promise<IPermissionInfo[]>;
}

export const PermissionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  action: { type: String, required: true },
  displayName: String,
  description: String
});

PermissionSchema.statics.findOrCreateOne = function(params: IPermissionInfo): Promise<IPermissionDocument> {
  const that = this;

  return new Promise<IPermissionDocument>((resolve, reject) => {
     that.findOne(params, function (err, permission) {
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

PermissionSchema.statics.getOrCreate = function (permissions: IPermissionInfo[] | IPermissionInfo): Promise<IPermissionDocument[]> {
  let that = this;

  if (!Array.isArray(permissions)) {
    permissions = [permissions];
  }

  return new Promise<IPermissionDocument[]>((resolve, reject) => {
    const permissionPromises = [];

    (<IPermissionInfo[]>permissions).forEach(p => {
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

PermissionSchema.statics.findAllPermissions = function(filter: string): Promise<IPermissionInfo[]> {
  return new Promise<IPermissionInfo[]>((resolve, reject) => {
    (<IPermissionModel>this).find()
      .then((permissions) => {
        if (permissions) {
          resolve(<any>permissions);
        }
        else {
          reject({ errors: [ {field: 'permission', errors: ['Not found'] } ], data: null });
        }
      })
      .catch((err) => {
        reject({ errors: [ {field: 'permission', errors: ['Not found'] } ], data: null });
      });
  });
};

export function getPermissionModel(m: mongoose.Connection): IPermissionModel {
    return <IPermissionModel>m.model('Permission', PermissionSchema, 'permissions');
}

import * as mongoose from 'mongoose';
import * as async from 'async';
import * as Promise from 'bluebird';
import { IQueryResponse } from '../../../data/models/common';

export interface IPermission {
    subject: String;
    action: String;
    displayName?: String;
    description?: String;
}

export interface IPermissionInfo {
  _id: string;
  action: string;
  subject: string;
}

export interface IPermissionDocument extends IPermission, mongoose.Document {}

export interface IPermissionModel extends mongoose.Model<IPermissionDocument> {
  findOrCreate(permission: any, callback);
  findAllPermissions(filter: string): Promise<IPermissionInfo[]>;
}

export const PermissionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  action: { type: String, required: true },
  displayName: String,
  description: String
});

PermissionSchema.statics.findOrCreate = function (params: any[], callback) {
  let that = this;

  function findOrCreateOne(params, callback) {
    that.findOne(params, function (err, permission) {
      if (err) return callback(err);
      if (permission) return callback(null, permission);
      that.create(params, callback);
    });
  }

  if (Array.isArray(params)) {
    let permissions = [];
    (<any>async).forEachSeries(params, function (param, next) {
      findOrCreateOne(param, function (err, permission) {
        permissions.push(permission);
        next(err);
      });
    }, function (err) {
      callback.apply(null, [err].concat(permissions));
    });
  }
  else {
    findOrCreateOne(params, callback);
  }
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

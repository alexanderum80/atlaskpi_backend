import * as mongoose from 'mongoose';
import * as async from 'async';

export interface IPermission {
    subject: String;
    action: String;
    displayName?: String;
    description?: String;
}

export interface IPermissionDocument extends IPermission, mongoose.Document { }

export interface IPermissionModel extends mongoose.Model<IPermissionDocument> {
  findOrCreate(permission: any, callback);
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

export function getPermissionModel(m: mongoose.Connection): IPermissionModel {
    return <IPermissionModel>m.model('Permission', PermissionSchema, 'permissions');
}

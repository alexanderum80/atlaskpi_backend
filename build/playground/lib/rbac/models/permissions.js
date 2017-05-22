"use strict";
var mongoose = require("mongoose");
var async = require("async");
exports.PermissionSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    action: { type: String, required: true },
    displayName: String,
    description: String
});
exports.PermissionSchema.statics.findOrCreate = function (params, callback) {
    var that = this;
    function findOrCreateOne(params, callback) {
        that.findOne(params, function (err, permission) {
            if (err)
                return callback(err);
            if (permission)
                return callback(null, permission);
            that.create(params, callback);
        });
    }
    if (Array.isArray(params)) {
        var permissions_1 = [];
        async.forEachSeries(params, function (param, next) {
            findOrCreateOne(param, function (err, permission) {
                permissions_1.push(permission);
                next(err);
            });
        }, function (err) {
            callback.apply(null, [err].concat(permissions_1));
        });
    }
    else {
        findOrCreateOne(params, callback);
    }
};
function getPermissionModel(m) {
    return m.model('Permission', exports.PermissionSchema, 'permissions');
}
exports.getPermissionModel = getPermissionModel;
//# sourceMappingURL=permissions.js.map
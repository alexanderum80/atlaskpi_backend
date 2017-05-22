"use strict";
var Promise = require("bluebird");
var _ = require("lodash");
var logger = require("winston");
var Enforcer = (function () {
    function Enforcer(config) {
        if (!config) {
            throw new Error('An enforcer instance requires config information');
        }
        this._config = config;
    }
    Enforcer.prototype.authorizationTo = function (activityName, identity) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            logger.debug('Checking allow authorization');
            // first call the global allow and deny callbacks
            if (_this._config.allow) {
                _this._config.allow(identity, activityName, function (err, authorized) {
                    if (err) {
                        throw err;
                    }
                    if (!authorized) {
                        resolve(authorized);
                    }
                });
            }
            logger.debug('Checking deny authorization');
            if (_this._config.deny) {
                _this._config.deny(identity, activityName, function (err, deny) {
                    if (err) {
                        throw err;
                    }
                    if (deny) {
                        resolve(!deny);
                    }
                });
            }
            logger.debug('Checking activity authorization');
            var activity = _.find(_this._config.activities, { may: activityName });
            if (!activity) {
                console.log('activity not found');
                reject({ err: new Error("Activity " + activityName + " was not found"), authorized: false });
            }
            _this._checkAuthorization(activity, identity).then(function (authorized) {
                resolve(authorized);
            })["catch"](function (err) {
                reject(err);
            });
        });
    };
    Enforcer.prototype._checkAuthorization = function (activity, identity) {
        return new Promise(function (resolve, reject) {
            if (!activity) {
                throw new Error('Cannot check authorization of an empty activity');
            }
            // the when callback has priority over the permissions list
            if (!activity.when && activity.hasPermissions) {
                // check only permissions
                var hasPermission_1 = true;
                activity.hasPermissions.forEach(function (permission) {
                    var permissionFound = _.find(identity.permissions, {
                        subject: permission.subject,
                        action: permission.action
                    });
                    if (!permissionFound) {
                        hasPermission_1 = false;
                        return false;
                    }
                });
                if (!hasPermission_1) {
                    resolve(hasPermission_1);
                }
            }
            activity.when(identity, function (err, authorized) {
                if (err) {
                    throw err;
                }
                resolve(authorized);
            });
        });
    };
    return Enforcer;
}());
exports.Enforcer = Enforcer;
//# sourceMappingURL=enforcer.js.map
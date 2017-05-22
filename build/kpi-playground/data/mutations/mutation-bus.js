"use strict";
var __1 = require("..");
var enforcer_1 = require("../../lib/enforcer");
var Promise = require("bluebird");
var MutationBus = (function () {
    function MutationBus(_enforcer) {
        this._enforcer = _enforcer;
    }
    Object.defineProperty(MutationBus.prototype, "enforcer", {
        get: function () {
            return this._enforcer;
        },
        enumerable: true,
        configurable: true
    });
    MutationBus.prototype.run = function (activityName, req, mutation, data) {
        // chack activity authorization
        return this.enforcer.authorizationTo(activityName, mutation.identity)
            .then(function (authorized) {
            if (!authorized) {
                return Promise.reject(authorized);
            }
            // run the mutation validation
            return mutation.validate ? mutation.validate(data) : { success: true };
        })
            .then(function (result) {
            // if it is valid
            if (!result.success) {
                return Promise.reject(__1.LocalizedError.fromValidationResult(req, result));
            }
            return Promise.resolve(true);
        })
            .then(function (validated) {
            return mutation.run(data);
        })
            .then(function (res) {
            if (res instanceof __1.MutationResponse) {
                return res.localized(req);
            }
            else {
                return res;
            }
        })["catch"](function (err) {
            return Promise.reject(err);
        });
    };
    return MutationBus;
}());
exports.MutationBus = MutationBus;
var _mutationBus = null;
function getMutationBusSingleton() {
    if (!_mutationBus) {
        var enforcer = new enforcer_1.Enforcer(enforcer_1.getEnforcerConfig());
        _mutationBus = new MutationBus(enforcer);
    }
    return _mutationBus;
}
exports.getMutationBusSingleton = getMutationBusSingleton;
//# sourceMappingURL=mutation-bus.js.map
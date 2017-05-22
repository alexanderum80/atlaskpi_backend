"use strict";
var enforcer_1 = require("../../lib/enforcer");
var Promise = require("bluebird");
var QueryBus = (function () {
    function QueryBus(_enforcer) {
        this._enforcer = _enforcer;
    }
    Object.defineProperty(QueryBus.prototype, "enforcer", {
        get: function () {
            return this._enforcer;
        },
        enumerable: true,
        configurable: true
    });
    QueryBus.prototype.run = function (activityName, query, data) {
        // chack activity authorization
        return this.enforcer.authorizationTo(activityName, query.identity)
            .then(function (authorized) {
            if (!authorized) {
                return Promise.reject(authorized);
            }
            return Promise.resolve(true);
        })
            .then(function (authorized) {
            if (authorized) {
                console.log('trying to run query');
                return query.run(data);
            }
        })["catch"](function (err) {
            return Promise.reject(err);
        });
    };
    return QueryBus;
}());
exports.QueryBus = QueryBus;
var _queryBus = null;
function getQueryBusSingleton() {
    if (!_queryBus) {
        var enforcer = new enforcer_1.Enforcer(enforcer_1.getEnforcerConfig());
        _queryBus = new QueryBus(enforcer);
    }
    return _queryBus;
}
exports.getQueryBusSingleton = getQueryBusSingleton;
//# sourceMappingURL=query-bus.js.map
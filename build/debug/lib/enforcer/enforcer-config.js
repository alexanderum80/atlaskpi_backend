"use strict";
var EnforcerConfig = (function () {
    function EnforcerConfig() {
        this._activities = [];
    }
    Object.defineProperty(EnforcerConfig.prototype, "allow", {
        get: function () {
            return this._allow;
        },
        set: function (callback) {
            this._allow = callback;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EnforcerConfig.prototype, "deny", {
        get: function () {
            return this._deny;
        },
        set: function (callback) {
            this._deny = callback;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EnforcerConfig.prototype, "activities", {
        get: function () {
            return this._activities;
        },
        enumerable: true,
        configurable: true
    });
    EnforcerConfig.prototype.addActivity = function (activity) {
        // make sure activity is not empty
        if (!activity) {
            throw new Error('Enfrocer does not allow empty activities');
        }
        // if the activity does not pass the validation an exception will be thrown
        this._validateActivity(activity);
        this._activities.push(activity);
    };
    EnforcerConfig.prototype.addActivities = function (activities) {
        var _this = this;
        // dp soe validations before saving the activities
        if (!activities) {
            throw new Error('Enforcer does not allow an empty list of activities');
        }
        activities.forEach(function (activity) { return _this.addActivity(activity); });
    };
    EnforcerConfig.prototype._validateActivity = function (activity) {
        // make sure all activities have at least a:
        // - can
        // - when method or permissions defined
        var includePermissions = activity.hasPermissions && activity.hasPermissions.length > 0;
        if (!includePermissions && !activity.when) {
            throw new Error("Activity " + activity.may + " does not include permissions or define when callback");
        }
    };
    return EnforcerConfig;
}());
exports.EnforcerConfig = EnforcerConfig;
var _enforcerConfig = null;
function getEnforcerConfig() {
    if (!_enforcerConfig) {
        _enforcerConfig = new EnforcerConfig();
    }
    return _enforcerConfig;
}
exports.getEnforcerConfig = getEnforcerConfig;
//# sourceMappingURL=enforcer-config.js.map
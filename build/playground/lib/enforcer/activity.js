"use strict";
var _ = require("lodash");
var ActivityCollection = (function () {
    function ActivityCollection() {
    }
    ActivityCollection.prototype.add = function (activity) {
        if (!activity) {
            throw { message: 'Activity cannot be null' };
        }
        this._activities.push(activity);
    };
    ActivityCollection.prototype.remove = function (activity) {
        _.remove(this._activities, function (a) { return a === activity; });
    };
    return ActivityCollection;
}());
exports.ActivityCollection = ActivityCollection;
//# sourceMappingURL=activity.js.map
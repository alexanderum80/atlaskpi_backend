"use strict";
var frequency_enum_1 = require("../../../models/common/frequency-enum");
var chart_1 = require("../charts/charts/chart");
var Promise = require("bluebird");
var GetDashboardQuery = (function () {
    function GetDashboardQuery(identity, _ctx) {
        this.identity = identity;
        this._ctx = _ctx;
    }
    // log = true;
    // audit = true;
    GetDashboardQuery.prototype.run = function (data) {
        var _this = this;
        var that = this;
        var dr = {
            from: new Date(data.dateRange.from),
            to: new Date(data.dateRange.to)
        };
        var frequency = frequency_enum_1.FrequencyTable[data.frequency];
        return new Promise(function (resolve, reject) {
            _this._ctx.Dashboard
                .findOne({ _id: data.id })
                .populate({
                path: 'charts',
                populate: { path: 'kpis' }
            })
                .then(function (dashboard) {
                // process charts
                var charts = dashboard.charts.map(function (c) { return new chart_1.Chart(c, that._ctx); });
                var promises = charts.map(function (c) {
                    return c.getDefinition(dr, frequency);
                });
                Promise.all(promises).then(function (charts) {
                    var response = {};
                    Object.assign(response, dashboard.toObject(), { charts: charts });
                    resolve(response);
                })["catch"](function (e) { return reject(e); });
            });
        });
    };
    return GetDashboardQuery;
}());
exports.GetDashboardQuery = GetDashboardQuery;
//# sourceMappingURL=get-dashboard.query.js.map
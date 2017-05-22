"use strict";
var per_hour_calculator_kpi_1 = require("../common/per-hour-calculator-kpi");
var revenue_by_ids_1 = require("../common/revenue-by-ids");
var work_hours_by_ids_1 = require("../common/work-hours-by-ids");
var Promise = require("bluebird");
var idAggregate = [
    {
        dateRange: true,
        $match: { 'employee.role': { $eq: 'Aesthetician' } }
    },
    { $group: { _id: { employeeId: '$employee.externalId' } } },
    { $project: { _id: 0, externalId: '$_id.employeeId' } }
];
var AestheticianRevenueRatePerHour = (function () {
    function AestheticianRevenueRatePerHour(_sales, _workLog) {
        this._sales = _sales;
        this._workLog = _workLog;
    }
    AestheticianRevenueRatePerHour.prototype.getData = function (dateRange, frequency) {
        var that = this;
        var hoursKpi = new work_hours_by_ids_1.WorkHoursByIds(this._workLog);
        var revenueKpi = new revenue_by_ids_1.RevenueByIds(this._sales);
        var aestheticianRevenueRatePerHourKpi = new per_hour_calculator_kpi_1.PerHourCalculator(idAggregate, this._sales, revenueKpi, hoursKpi);
        return new Promise(function (resolve, reject) {
            aestheticianRevenueRatePerHourKpi.getData(dateRange, frequency).then(function (data) {
                resolve(that._toSeries(data));
            }, function (e) { return reject(e); });
        });
    };
    AestheticianRevenueRatePerHour.prototype._toSeries = function (rawData) {
        return [{
                name: 'Aesthetician Revenue Rate Per Hour',
                data: rawData.map(function (item) { return [item._id.frequency, item.revenuePerHour]; })
            }];
    };
    return AestheticianRevenueRatePerHour;
}());
exports.AestheticianRevenueRatePerHour = AestheticianRevenueRatePerHour;
//# sourceMappingURL=aesthetician-revenue-per-hour.js.map
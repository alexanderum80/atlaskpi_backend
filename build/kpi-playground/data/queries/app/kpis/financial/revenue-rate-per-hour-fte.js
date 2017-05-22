"use strict";
var per_hour_calculator_kpi_1 = require("../common/per-hour-calculator-kpi");
var revenue_by_ids_1 = require("../common/revenue-by-ids");
var work_hours_by_ids_1 = require("../common/work-hours-by-ids");
var Promise = require("bluebird");
var idAggregate = [
    {
        dateRange: true,
        $match: { 'employee.type': { $eq: 'f' } }
    },
    { $group: { _id: { employeeId: '$employee.externalId' } } },
    { $project: { _id: 0, externalId: '$_id.employeeId' } }
];
var RevenueRateByFTEmployee = (function () {
    function RevenueRateByFTEmployee(_sales, _workLog) {
        this._sales = _sales;
        this._workLog = _workLog;
    }
    RevenueRateByFTEmployee.prototype.getData = function (dateRange, frequency) {
        var that = this;
        var hoursKpi = new work_hours_by_ids_1.WorkHoursByIds(this._workLog);
        var revenueKpi = new revenue_by_ids_1.RevenueByIds(this._sales);
        var revenueRateByFTEmployeeKpi = new per_hour_calculator_kpi_1.PerHourCalculator(idAggregate, this._sales, revenueKpi, hoursKpi);
        return new Promise(function (resolve, reject) {
            revenueRateByFTEmployeeKpi.getData(dateRange, frequency).then(function (data) {
                resolve(that._toSeries(data));
            }), function (e) { return reject(e); };
        });
    };
    RevenueRateByFTEmployee.prototype._toSeries = function (rawData) {
        return [{
                name: 'Revenue Rate By FT Employee',
                data: rawData.map(function (item) { return [item._id.frequency, item.revenuePerHour]; })
            }];
    };
    return RevenueRateByFTEmployee;
}());
exports.RevenueRateByFTEmployee = RevenueRateByFTEmployee;
//# sourceMappingURL=revenue-rate-per-hour-fte.js.map
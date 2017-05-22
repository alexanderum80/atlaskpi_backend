"use strict";
var per_hour_calculator_kpi_1 = require("../common/per-hour-calculator-kpi");
var revenue_by_ids_1 = require("../common/revenue-by-ids");
var work_hours_by_ids_1 = require("../common/work-hours-by-ids");
var Promise = require("bluebird");
var idAggregate = [
    {
        dateRange: true,
        $match: { 'employee.role': { $ne: 'Physician' } }
    },
    { $group: { _id: { employeeId: '$employee.externalId' } } },
    { $project: { _id: 0, externalId: '$_id.employeeId' } }
];
var IndividualNonPhysicianRevenueRatePerHour = (function () {
    function IndividualNonPhysicianRevenueRatePerHour(_sales, _workLog) {
        this._sales = _sales;
        this._workLog = _workLog;
    }
    IndividualNonPhysicianRevenueRatePerHour.prototype.getData = function (dateRange, frequency) {
        var that = this;
        var hoursKpi = new work_hours_by_ids_1.WorkHoursByIds(this._workLog);
        var revenueKpi = new revenue_by_ids_1.RevenueByIds(this._sales);
        var individualNonPhysicianRevenueRatePerHourKpi = new per_hour_calculator_kpi_1.PerHourCalculator(idAggregate, this._sales, revenueKpi, hoursKpi);
        return new Promise(function (resolve, reject) {
            individualNonPhysicianRevenueRatePerHourKpi.getData(dateRange, frequency)
                .then(function (data) {
                resolve(that._toSeries(data));
            }, function (e) { return reject(e); });
        });
    };
    IndividualNonPhysicianRevenueRatePerHour.prototype._toSeries = function (rawData) {
        return [{
                name: 'Individual Non Physician Revenue Rate Per Hour',
                data: rawData.map(function (item) { return [item._id.frequency, item.revenuePerHour]; })
            }];
    };
    return IndividualNonPhysicianRevenueRatePerHour;
}());
exports.IndividualNonPhysicianRevenueRatePerHour = IndividualNonPhysicianRevenueRatePerHour;
//# sourceMappingURL=indiviual-non-physician-revenue-per-hour.js.map
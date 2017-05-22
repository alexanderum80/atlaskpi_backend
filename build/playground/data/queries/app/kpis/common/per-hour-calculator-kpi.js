"use strict";
var kpi_base_1 = require("../kpi-base");
var Promise = require("bluebird");
var PerHourCalculator = (function () {
    function PerHourCalculator(_idAggregate, _sales, _revenueKpi, _hoursKpi) {
        this._idAggregate = _idAggregate;
        this._sales = _sales;
        this._revenueKpi = _revenueKpi;
        this._hoursKpi = _hoursKpi;
        this._validateArguments();
    }
    PerHourCalculator.prototype.getData = function (dateRange, frequency) {
        var that = this;
        var ids;
        var hours;
        var revenue;
        return this._getEmployeeIds(this._idAggregate, dateRange)
            .then(function (externalIds) {
            ids = externalIds;
            that._hoursKpi.setExternalids(ids);
            return that._hoursKpi.getData(dateRange, frequency);
        })
            .then(function (h) {
            hours = h;
            that._revenueKpi.setExternalids(ids);
            return that._revenueKpi.getData(dateRange, frequency);
        })
            .then(function (r) {
            revenue = r;
            return that._calcRevenuePerHour(revenue, hours);
        });
    };
    PerHourCalculator.prototype._getEmployeeIds = function (aggregate, dateRange) {
        var idsKpi = new kpi_base_1.KpiBase(this._sales, aggregate);
        return idsKpi.executeQuery('product.from', dateRange)
            .then(function (ids) { return Promise.resolve(ids.map(function (i) { return i.externalId; })); })["catch"](function (err) { return Promise.reject(err); });
    };
    PerHourCalculator.prototype._calcRevenuePerHour = function (revenue, hours) {
        var _this = this;
        var revenuePerHour = [];
        hours.forEach(function (h) {
            var rPerHour = _this._getRevenuePerHour(h._id.frequency, revenue, hours);
            if (!rPerHour) {
                return;
            }
            ;
            revenuePerHour.push({ _id: { frequency: h._id.frequency },
                revenuePerHour: rPerHour });
        });
        return Promise.resolve(revenuePerHour);
    };
    PerHourCalculator.prototype._getRevenuePerHour = function (date, revenue, hours) {
        var hoursOfDay = hours.find(function (h) { return h._id.frequency === date; });
        var revenueOfDay = revenue.find(function (h) { return h._id.frequency === date; });
        if (!hoursOfDay || hoursOfDay.hours === 0) {
            return 0;
        }
        ;
        if (!revenueOfDay) {
            return 0;
        }
        ;
        return revenueOfDay.revenue / hoursOfDay.hours;
    };
    PerHourCalculator.prototype._validateArguments = function () {
        if (!this._idAggregate || !this._sales ||
            !this._revenueKpi || !this._hoursKpi) {
            throw 'Missing or Unitialized arguments. ';
        }
    };
    return PerHourCalculator;
}());
exports.PerHourCalculator = PerHourCalculator;
//# sourceMappingURL=per-hour-calculator-kpi.js.map
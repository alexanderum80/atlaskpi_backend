"use strict";
var Promise = require("bluebird");
var RatioSalesCalculatorKPI = (function () {
    function RatioSalesCalculatorKPI(_partKpi, _totalKpi) {
        this._partKpi = _partKpi;
        this._totalKpi = _totalKpi;
    }
    RatioSalesCalculatorKPI.prototype.getData = function (dateRange, frequency) {
        var _this = this;
        var that = this;
        var totalRevenue;
        var partRevenue;
        return this._totalKpi.getData(dateRange, frequency)
            .then(function (t) {
            totalRevenue = t;
            return _this._partKpi.getData(dateRange, frequency);
        }).then(function (p) {
            partRevenue = p;
            return that._calcRatioSales(partRevenue, totalRevenue);
        });
    };
    RatioSalesCalculatorKPI.prototype._calcRatioSales = function (part, total) {
        var _this = this;
        var salesRatio = [];
        total.forEach(function (t) {
            var ratio = _this._getSalesRatioByFrequencyItem(t._id.frequency, part, total);
            if (!ratio) {
                return;
            }
            salesRatio.push({ _id: { frequency: t._id.frequency },
                ratio: ratio });
        });
        return Promise.resolve(salesRatio);
    };
    RatioSalesCalculatorKPI.prototype._getSalesRatioByFrequencyItem = function (frequencyItem, partRevenue, totalRevenue) {
        var revenueOfFrequencyItem = partRevenue.find(function (h) { return h._id.frequency === frequencyItem; });
        var totalOfFrequencyItem = totalRevenue.find(function (h) { return h._id.frequency === frequencyItem; });
        if (!totalOfFrequencyItem || totalOfFrequencyItem.revenue === 0) {
            return null;
        }
        ;
        if (!revenueOfFrequencyItem) {
            return 0;
        }
        ;
        // validation check for operand order, to help for debuging
        if (revenueOfFrequencyItem.revenue > totalOfFrequencyItem.revenue) {
            throw 'Total revenue cannot be less than part revenue, give it a try switching the order of the arguments of RatioSalesCalculatorKPI.getData(...)';
        }
        return revenueOfFrequencyItem.revenue / totalOfFrequencyItem.revenue * 100;
    };
    return RatioSalesCalculatorKPI;
}());
exports.RatioSalesCalculatorKPI = RatioSalesCalculatorKPI;
//# sourceMappingURL=ratio-sales-calculator-kpi.js.map
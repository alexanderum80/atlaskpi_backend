"use strict";
var ratio_sales_calculator_kpi_1 = require("../common/ratio-sales-calculator-kpi");
var other_sales_1 = require("../common/other-sales");
var total_revenue_1 = require("../common/total-revenue");
var Promise = require("bluebird");
var OtherSalesRatio = (function () {
    function OtherSalesRatio(_sales) {
        this._sales = _sales;
    }
    OtherSalesRatio.prototype.getData = function (dateRange, frequency) {
        var that = this;
        var totalRevenueKpi = new total_revenue_1.TotalRevenue(this._sales);
        var otherRevenueKpi = new other_sales_1.OtherSales(this._sales);
        var otherSalesRatioKpi = new ratio_sales_calculator_kpi_1.RatioSalesCalculatorKPI(otherRevenueKpi, totalRevenueKpi);
        return new Promise(function (resolve, reject) {
            otherSalesRatioKpi.getData(dateRange, frequency).then(function (data) {
                resolve(that._toSeries(data));
            }), function (e) { return reject(e); };
        });
    };
    OtherSalesRatio.prototype._toSeries = function (rawData) {
        return [{
                name: 'Other Sales Ratio',
                data: rawData.map(function (item) { return [item._id.frequency, item.ratio]; })
            }];
    };
    return OtherSalesRatio;
}());
exports.OtherSalesRatio = OtherSalesRatio;
//# sourceMappingURL=other-sales-ratio.js.map
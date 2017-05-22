"use strict";
var ratio_sales_calculator_kpi_1 = require("../common/ratio-sales-calculator-kpi");
var total_revenue_1 = require("../common/total-revenue");
var retail_sales_1 = require("../common/retail-sales");
var Promise = require("bluebird");
var RetailSalesRatio = (function () {
    function RetailSalesRatio(_sales) {
        this._sales = _sales;
    }
    RetailSalesRatio.prototype.getData = function (dateRange, frequency) {
        var that = this;
        var totalRevenueKpi = new total_revenue_1.TotalRevenue(this._sales);
        var retailRevenueKpi = new retail_sales_1.RetailSales(this._sales);
        var retailSalesRatioKpi = new ratio_sales_calculator_kpi_1.RatioSalesCalculatorKPI(retailRevenueKpi, totalRevenueKpi);
        return new Promise(function (resolve, reject) {
            retailSalesRatioKpi.getData(dateRange, frequency).then(function (data) {
                resolve(that._toSeries(data));
            });
        });
    };
    RetailSalesRatio.prototype._toSeries = function (rawData) {
        return [{
                name: 'Retail Sales Ratio',
                data: rawData.map(function (item) { return [item._id.frequency, item.ratio]; })
            }];
    };
    return RetailSalesRatio;
}());
exports.RetailSalesRatio = RetailSalesRatio;
//# sourceMappingURL=retail-sales-ratio.js.map
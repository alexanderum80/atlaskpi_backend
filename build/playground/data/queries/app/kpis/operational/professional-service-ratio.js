"use strict";
var ratio_sales_calculator_kpi_1 = require("../common/ratio-sales-calculator-kpi");
var profesional_service_sales_1 = require("../more-financial/profesional-service-sales");
var total_revenue_1 = require("../common/total-revenue");
var Promise = require("bluebird");
var ProfesionalSalesRatio = (function () {
    function ProfesionalSalesRatio(_sales) {
        this._sales = _sales;
    }
    ProfesionalSalesRatio.prototype.getData = function (dateRange, frequency) {
        var that = this;
        var totalRevenueKpi = new total_revenue_1.TotalRevenue(this._sales);
        var profesionalRevenueKpi = new profesional_service_sales_1.ProfesionalServiceSales(this._sales, true);
        var profesionalSalesRatioKpi = new ratio_sales_calculator_kpi_1.RatioSalesCalculatorKPI(profesionalRevenueKpi, totalRevenueKpi);
        return new Promise(function (resolve, reject) {
            profesionalSalesRatioKpi.getData(dateRange, frequency).then(function (data) {
                resolve(that._toSeries(data));
            }), function (e) { return reject(e); };
        });
    };
    ProfesionalSalesRatio.prototype._toSeries = function (rawData) {
        return [{
                name: 'Profesional Sales Ratio',
                data: rawData.map(function (item) { return [item._id.frequency, item.ratio]; })
            }];
    };
    return ProfesionalSalesRatio;
}());
exports.ProfesionalSalesRatio = ProfesionalSalesRatio;
//# sourceMappingURL=professional-service-ratio.js.map
"use strict";
var ratio_sales_calculator_kpi_1 = require("../common/ratio-sales-calculator-kpi");
var ambulatory_surgery_center_sales_1 = require("../more-financial/ambulatory-surgery-center-sales");
var total_revenue_1 = require("../common/total-revenue");
var Promise = require("bluebird");
var AmbulatorySurgeryCenterServiceRatio = (function () {
    function AmbulatorySurgeryCenterServiceRatio(_sales) {
        this._sales = _sales;
    }
    AmbulatorySurgeryCenterServiceRatio.prototype.getData = function (dateRange, frequency) {
        var that = this;
        var totalRevenueKpi = new total_revenue_1.TotalRevenue(this._sales);
        var ambulatoryRevenueKpi = new ambulatory_surgery_center_sales_1.AmbulatorySurgeryCenterSales(this._sales, true);
        var ambulatorySurgeryCenterServiceRatioKpi = new ratio_sales_calculator_kpi_1.RatioSalesCalculatorKPI(ambulatoryRevenueKpi, totalRevenueKpi);
        return new Promise(function (resolve, reject) {
            ambulatorySurgeryCenterServiceRatioKpi.getData(dateRange, frequency).then(function (data) {
                resolve(that._toSeries(data));
            }), function (e) { return reject(e); };
        });
    };
    AmbulatorySurgeryCenterServiceRatio.prototype._toSeries = function (rawData) {
        return [{
                name: 'Ambulatory Surgery Center Service Ratio',
                data: rawData.map(function (item) { return [item._id.frequency, item.ratio]; })
            }];
    };
    return AmbulatorySurgeryCenterServiceRatio;
}());
exports.AmbulatorySurgeryCenterServiceRatio = AmbulatorySurgeryCenterServiceRatio;
//# sourceMappingURL=ambulatory-surgery-center-service-ratio.js.map
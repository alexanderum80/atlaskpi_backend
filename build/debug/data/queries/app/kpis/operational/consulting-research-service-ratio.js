"use strict";
var ratio_sales_calculator_kpi_1 = require("../common/ratio-sales-calculator-kpi");
var consulting_research_sales_1 = require("../more-financial/consulting-research-sales");
var total_revenue_1 = require("../common/total-revenue");
var Promise = require("bluebird");
var ConsultingResearchServiceRatio = (function () {
    function ConsultingResearchServiceRatio(_sales) {
        this._sales = _sales;
    }
    ConsultingResearchServiceRatio.prototype.getData = function (dateRange, frequency) {
        var that = this;
        var totalRevenueKpi = new total_revenue_1.TotalRevenue(this._sales);
        var consultingResearchRevenueKpi = new consulting_research_sales_1.ConsultingResearchSales(this._sales, true);
        var consultingResearchServiceRatioKPI = new ratio_sales_calculator_kpi_1.RatioSalesCalculatorKPI(consultingResearchRevenueKpi, totalRevenueKpi);
        return new Promise(function (resolve, reject) {
            consultingResearchServiceRatioKPI.getData(dateRange, frequency).then(function (data) {
                resolve(that._toSeries(data));
            }), function (e) { return reject(e); };
        });
    };
    ConsultingResearchServiceRatio.prototype._toSeries = function (rawData) {
        return [{
                name: 'Consulting Research Service Ratio',
                data: rawData.map(function (item) { return [item._id.frequency, item.ratio]; })
            }];
    };
    return ConsultingResearchServiceRatio;
}());
exports.ConsultingResearchServiceRatio = ConsultingResearchServiceRatio;
//# sourceMappingURL=consulting-research-service-ratio.js.map
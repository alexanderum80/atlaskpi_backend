"use strict";
var ChartCategoriesPostProcessor = (function () {
    function ChartCategoriesPostProcessor() {
    }
    ChartCategoriesPostProcessor.prototype.process = function (code, series) {
        switch (code) {
            case 'AestheticianRevenueRatePerHour':
                return this._aestheticianRevenueRatePerHour(series);
            default:
                return null;
        }
    };
    ChartCategoriesPostProcessor.prototype._aestheticianRevenueRatePerHour = function (series) {
        return Array(series[0].data).map(function (element) {
            return element[0];
        });
    };
    return ChartCategoriesPostProcessor;
}());
exports.ChartCategoriesPostProcessor = ChartCategoriesPostProcessor;
//# sourceMappingURL=chart-categories-postprocessor.js.map
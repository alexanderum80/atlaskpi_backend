"use strict";
var kpi_factory_1 = require("../../kpis/kpi.factory");
var Promise = require("bluebird");
var chart_postprocessing_extention_1 = require("./chart-postprocessing-extention");
var Chart = (function () {
    function Chart(_chart, ctx) {
        this._chart = _chart;
        if (!_chart.kpis || _chart.kpis.length < 1) {
            throw 'A chart cannot be created with a KPI';
        }
        this._kpi = kpi_factory_1.getKPI(_chart.kpis[0].code, ctx);
    }
    Chart.prototype.getDefinition = function (dateRange, frequency) {
        var that = this;
        var chartProcessor = new chart_postprocessing_extention_1.ChartPostProcessingExtention();
        return new Promise(function (resolve, reject) {
            var chartDr;
            that._kpi.getData(dateRange, frequency).then(function (series) {
                that._chart.chartDefinition = chartProcessor.process(that._chart, series);
                resolve(JSON.stringify(that._chart.chartDefinition));
            }, function (e) { return reject(e); });
        });
    };
    return Chart;
}());
exports.Chart = Chart;
//# sourceMappingURL=chart.js.map
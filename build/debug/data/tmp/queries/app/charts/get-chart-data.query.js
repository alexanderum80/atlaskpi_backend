"use strict";
var chart_processor_1 = require("./chart-processor");
var GetChartDataQuery = (function () {
    function GetChartDataQuery(identity, _ctx) {
        this.identity = identity;
        this._ctx = _ctx;
    }
    GetChartDataQuery.prototype.run = function (data) {
        var processor = new chart_processor_1.ChartProcessor(this._ctx);
        return processor.getChart(data.id);
    };
    return GetChartDataQuery;
}());
exports.GetChartDataQuery = GetChartDataQuery;
//# sourceMappingURL=get-chart-data.query.js.map
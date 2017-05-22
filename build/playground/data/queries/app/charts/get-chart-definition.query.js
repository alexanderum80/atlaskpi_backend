"use strict";
var chart_processor_1 = require("./chart-processor");
var GetChartDefinitionQuery = (function () {
    function GetChartDefinitionQuery(identity, _ctx) {
        this.identity = identity;
        this._ctx = _ctx;
    }
    GetChartDefinitionQuery.prototype.run = function (data) {
        var processor = new chart_processor_1.ChartProcessor(this._ctx);
        return processor.getChartDefinition(data);
    };
    return GetChartDefinitionQuery;
}());
exports.GetChartDefinitionQuery = GetChartDefinitionQuery;
//# sourceMappingURL=get-chart-definition.query.js.map
"use strict";
var chart_collection_1 = require("./chart-collection");
var GetChartsQuery = (function () {
    function GetChartsQuery(identity, _ctx) {
        this.identity = identity;
        this._ctx = _ctx;
    }
    GetChartsQuery.prototype.run = function (data) {
        var processor = new chart_collection_1.ChartCollection(this._ctx);
        return processor.getCharts(data);
    };
    return GetChartsQuery;
}());
exports.GetChartsQuery = GetChartsQuery;
//# sourceMappingURL=get-charts.query.js.map
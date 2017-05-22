"use strict";
var Promise = require("bluebird");
var chart_processor_1 = require("./chart-processor");
var ChartCollection = (function () {
    function ChartCollection(_ctx) {
        this._ctx = _ctx;
    }
    ChartCollection.prototype.getCharts = function (data) {
        var _this = this;
        var that = this;
        return new Promise(function (resolve, reject) {
            var definitions = [];
            _this._ctx.Chart.find().then(function (charts) {
                charts.forEach(function (chart) {
                    var payload = {
                        id: chart._id,
                        from: data.from,
                        to: data.to
                    };
                    if (data.preview) {
                        definitions.push(chart);
                    }
                    else {
                        var processor = new chart_processor_1.ChartProcessor(_this._ctx);
                        definitions.push(processor.getChartDefinition(payload));
                    }
                });
                Promise.all(definitions).then(function (data) {
                    resolve(JSON.stringify(data));
                });
            });
        });
    };
    return ChartCollection;
}());
exports.ChartCollection = ChartCollection;
//# sourceMappingURL=chart-collection.js.map
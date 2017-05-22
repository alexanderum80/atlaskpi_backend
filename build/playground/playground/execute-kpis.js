"use strict";
var net_revenue_by_fte_1 = require("../data/queries/app/kpis/financial/net-revenue-by-fte");
var app_context_1 = require("../data/models/app/app-context");
var common_1 = require("../data/models/common");
var mongoose = require("mongoose");
function executeKpis() {
    mongoose.set('debug', true);
    app_context_1.getContext('mongodb://localhost/customer2').then(function (ctx) {
        var dateRange = {
            from: new Date('2016-01-01'),
            to: new Date('2016-12-31')
        };
        var frequency = common_1.FrequencyEnum.Monthly;
        mongoose.set('debug', true);
        // let kpi = new AestheticianRevenueRatePerHour(ctx.Sale, ctx.WorkLog);
        var kpi = new net_revenue_by_fte_1.NetRevenueByFTE(ctx.Sale);
        kpi.getData(dateRange, frequency).then(function (data) {
            // let definition = `{
            //     "chart": {
            //         "type": "pie"
            //     },
            //     "title": {
            //         "text": "Chart Title"
            //     },
            //     "subtitle": {
            //         "text": "Subtitle for Chart"
            //     },
            //     "plotOptions": {
            //         "pie": {
            //             "dataLabels": {
            //                 "enabled": true
            //             },
            //             "showInLegend": false
            //         }
            //     }
            // }`;
            var series = data;
            // let chart = new Chart(definition, series);
            console.log(JSON.stringify(data));
        });
    });
}
exports.executeKpis = executeKpis;
//# sourceMappingURL=execute-kpis.js.map
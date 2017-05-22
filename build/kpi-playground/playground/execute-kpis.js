"use strict";
var aesthetician_revenue_per_hour_1 = require("../data/queries/app/kpis/more-financial/aesthetician-revenue-per-hour");
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
        var kpi = new aesthetician_revenue_per_hour_1.AestheticianRevenueRatePerHour(ctx.Sale, ctx.WorkLog);
        // let kpi = new RetailSales(ctx.Sale);
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
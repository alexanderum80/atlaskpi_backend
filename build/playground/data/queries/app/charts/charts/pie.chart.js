"use strict";
var chartTemplate = "\n    \"chart\": {\n        \"type\": \"{{type}}\"\n    },\n    \"title\": {\n        \"text\": \"{{title}}\"\n    },\n    \"subtitle\": {\n        \"text\": \"{{subtitle}}\"\n    },\n    \"plotOptions\": {\n        \"pie\": {\n            \"dataLabels\": {\n                \"enabled\": true\n            },\n            \"showInLegend\": false\n        }\n    }\n";
var PieChart = (function () {
    function PieChart(data, opts) {
        this.data = data;
        this.type = 'pie';
        this.is3d = false;
        Object.assign(this, opts);
    }
    return PieChart;
}());
exports.PieChart = PieChart;
//# sourceMappingURL=pie.chart.js.map
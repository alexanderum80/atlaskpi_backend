"use strict";
var models_1 = require("../models");
var newCharts = [
    {
        name: 'Chart1',
        description: 'Random description for chat #1',
        group: 'group 1',
        frequency: 'semanal',
        kpis: ['fran', 'new'],
        chartFormat: 'Formato1',
        dataRange: { predefined: 'Daily' }
    },
    {
        name: 'Chart2',
        description: 'Random description for chat #2',
        group: 'group 2',
        frequency: 'semanal',
        kpis: ['lolo', 'cuco'],
        chartFormat: 'Formato2',
        dataRange: { predefined: 'Daily' }
    }
];
function seedCharts() {
    models_1.getContext('mongodb://localhost/customer2').then(function (ctx) {
        // ctx.Chart.find({}).then((charts) => {
        //       if (charts.length > 0) {
        //           return;
        //       }
        //     winston.debug('Seeding business units for customer2');
        //     newCharts.forEach((chart: IChartDetails) => {
        //         ctx.Chart.createChart(chart).then((response) => {
        //             winston.info(`seeded chart: ${response.entity.name}`);
        //         }, (err) => {
        //             winston.error('Error creating Chart: ', err);
        //         });
        //     });
        // });
    });
}
exports.__esModule = true;
exports["default"] = seedCharts;
;
//# sourceMappingURL=charts.js.map
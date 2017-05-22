"use strict";
var models_1 = require("../models");
var winston = require("winston");
var newKPIs = [
    {
        'name': 'KPI Number 1',
        'description': 'This is the KPI Number 1 Description, is only data to be displayed',
        'formula': 'E = mc2'
    },
    {
        'name': 'KPI Number 2',
        'description': 'This is the KPI Number 2 Description, is only data to be displayed',
        'formula': 'V = D/T'
    },
    {
        'name': 'KPI Number 3',
        'description': 'This is the KPI Number 3 Description, is only data to be displayed',
        'formula': 'a = V/T'
    },
    {
        'name': 'KPI Number 4',
        'description': 'This is the KPI Number 4 Description, is only data to be displayed',
        'formula': 'P = F/A'
    },
    {
        'name': 'KPI Number 5',
        'description': 'This is the KPI Number 5 Description, is only data to be displayed',
        'formula': 'P = CH*2+F(p)'
    },
    {
        'name': 'KPI Number 6',
        'description': 'This is the KPI Number 6 Description, is only data to be displayed',
        'formula': 'Q = ab(7+c)'
    },
    {
        'name': 'KPI Number 7',
        'description': 'This is the KPI Number 7 Description, is only data to be displayed',
        'formula': 'MB = 2*5(mc)'
    }
];
function seedKPIs() {
    models_1.getContext('mongodb://localhost/customer2').then(function (ctx) {
        ctx.KPI.find({}).then(function (kpis) {
            if (kpis.length > 0) {
                return;
            }
            winston.debug('Seeding kpis for customer2');
            newKPIs.forEach(function (kpi) {
                ctx.KPI.createKPI(kpi).then(function (response) {
                    winston.info('KPI Created: ', kpi.name);
                }, function (err) {
                    winston.error('Error creating KPI: ', err);
                });
            });
        });
    });
}
exports.__esModule = true;
exports["default"] = seedKPIs;
;
//# sourceMappingURL=kpis.js.map
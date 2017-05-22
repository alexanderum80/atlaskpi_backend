"use strict";
var models_1 = require("../../models");
var fs = require("fs");
var path = require("path");
function seedApp() {
    var dataFiles = [
        // { model: 'Customer', filename: 'customers.json' },
        // { model: 'Employee', filename: 'employees.json' },
        // { model: 'Expense', filename: 'expenses.json' },
        // { model: 'Inventory', filename: 'inventory.json' },
        // { model: 'Location', filename: 'locations.json' },
        // { model: 'Product', filename: 'products.json' },
        // { model: 'Revenue', filename: 'revenues.json' },
        // { model: 'Survey', filename: 'surveys.json' },
        { model: 'KPI', filename: 'kpis.json' },
        { model: 'Chart', filename: 'charts.json' },
        { model: 'Dashboard', filename: 'dashboards.json' }
    ];
    models_1.getContext('mongodb://localhost/customer2').then(function (ctx) {
        // test
        var count = ctx.Sale.find({}).count(function (err, count) {
            console.log('Number of records in sales collection: ' + count);
        });
        var _loop_1 = function (i) {
            // make sure the collection is empty
            var data = dataFiles[i];
            var model = ctx[data.model];
            var items = model.find({}).count(function (err, count) {
                console.log('Count for ' + data.model + ' = ' + count);
                if (!count || count === 0) {
                    console.log("seeding " + data.model);
                    var file = fs.readFile(path.join(__dirname, data.filename), { encoding: 'utf-8' }, function (err, data) {
                        if (err)
                            throw err;
                        var dataArray = JSON.parse(data);
                        model.insertMany(dataArray, function (err, doc) {
                            if (err)
                                throw err;
                        });
                    });
                }
            });
        };
        for (var i = 0; i < dataFiles.length; i++) {
            _loop_1(i);
        }
        ;
    });
}
exports.seedApp = seedApp;
;
//# sourceMappingURL=seed-app.js.map
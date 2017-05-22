"use strict";
var app_context_1 = require("../../data/models/app/app-context");
var async = require("async");
var Promise = require("bluebird");
function importSpreadSheetData(data) {
    return new Promise(function (resolve, reject) {
        async.parallel([
            async.apply(importSales, data),
            async.apply(importWorklog, data),
            async.apply(importExpenses, data)
        ], function (err, results) {
            if (err) {
                console.log('There was an error: ' + err.toString());
                reject(err);
            }
            else {
                resolve(results);
            }
        });
    });
}
exports.__esModule = true;
exports["default"] = importSpreadSheetData;
function importSales(data, cb) {
    app_context_1.getContext('mongodb://localhost/customer2').then(function (ctx) {
        var sales = data.sales;
        // map the data
        var mappedSales = sales.map(function (s) {
            return {
                location: getLocation(data.location, s.location),
                customer: getCustomer(data.customer, s.customer),
                employee: getEmployee(data.employee, s.employee),
                product: getProduct(data.product, s.product, +s.price, new Date(s.date)),
                category: getCategory(data.category, s.category),
                timestamp: new Date(s.date)
            };
        });
        ctx.Sale.remove({}).then(function (res) {
            ctx.Sale.insertMany(mappedSales, function (err, result) {
                if (err) {
                    console.error('Error inserting sales', err);
                    cb(err, null);
                }
                else {
                    console.info(result.length + " sales inserted");
                    cb(null, { name: 'sales', total: result.length });
                }
            });
        });
    });
}
function importWorklog(data, cb) {
    app_context_1.getContext('mongodb://localhost/customer2').then(function (ctx) {
        var worklog = data.worklog;
        var mappedWorklog = worklog.map(function (w) {
            return {
                externalId: getEmployee(data.employee, w.employee).externalId.toString(),
                date: w.date,
                workTime: w.seconds
            };
        });
        ctx.WorkLog.remove({}).then(function (res) {
            ctx.WorkLog.insertMany(mappedWorklog, function (err, result) {
                if (err) {
                    console.error('Error inserting worklog', err);
                    cb(err, null);
                }
                else {
                    console.info(result.length + " workklog inserted");
                    cb(null, { name: 'worklogs', total: result.length });
                }
            });
        });
    });
}
function importExpenses(data, cb) {
    app_context_1.getContext('mongodb://localhost/customer2').then(function (ctx) {
        var expenses = data.expense;
        var mappedExpenses = expenses.map(function (e) {
            return {
                location: getLocation(data.location, e.location),
                exployee: getEmployee(data.employee, e.employee),
                expense: {
                    concept: e.category,
                    amount: +e.amount
                }
            };
        });
        ctx.Expense.remove({}).then(function (res) {
            ctx.Expense.insertMany(mappedExpenses, function (err, result) {
                if (err) {
                    console.error('Error inserting expenses', err);
                    cb(err, null);
                }
                else {
                    console.info(result.length + " expenses inserted");
                    cb(null, { name: 'expenses', total: result.length });
                }
            });
        });
    });
}
// utility methods
function getLocation(locations, name) {
    var l = locations.find(function (loc) { return loc.name === name; });
    return {
        identifier: l.id,
        name: l.name,
        city: l.city,
        state: l.state,
        zip: l.zip
    };
}
function getCustomer(customers, name) {
    var c = customers.find(function (cus) { return cus.name === name; });
    return {
        externalId: c.id,
        name: c.name,
        city: c.city,
        state: c.state,
        zip: c.zip,
        gender: c.gender
    };
}
function getEmployee(employees, name) {
    var e = employees.find(function (emp) { return emp.name === name; });
    if (!e) {
        return {
            externalId: 0,
            name: ''
        };
    }
    return {
        externalId: e.id,
        name: e.name,
        role: e.role,
        type: e.fte === 'Yes' ? 'f' : 'p'
    };
}
function getProduct(products, name, price, date) {
    var p = products.find(function (prod) { return prod.name === name; });
    return {
        externalId: p.id,
        name: p.name,
        cost: 0,
        price: price,
        tax: 0.7,
        tax2: 0,
        type: p.type.toLowerCase(),
        from: date,
        to: date
    };
}
function getCategory(categories, name) {
    var c = categories.find(function (cat) { return cat.name === name; });
    return {
        externalId: c.id,
        name: c.name
    };
}
//# sourceMappingURL=kpibi-importer.js.map
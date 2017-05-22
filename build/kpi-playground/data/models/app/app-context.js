"use strict";
var Sale_1 = require("./sales/Sale");
var Inventory_1 = require("./inventory/Inventory");
var surveys_1 = require("./surveys");
var Promise = require("bluebird");
var mongo_utils_1 = require("../../mongo-utils");
var users_1 = require("./users");
var rbac_1 = require("../../../lib/rbac");
var kpis_1 = require("./kpis");
var business_units_1 = require("./business-units");
var chart_formats_1 = require("./chart-formats");
var charts_1 = require("./charts");
var dashboards_1 = require("./dashboards");
var WorkLog_1 = require("./work-log/WorkLog");
var Expenses_1 = require("./expenses/Expenses");
var winston = require("winston");
function getContext(dbUri) {
    winston.debug("Getting app context for: " + dbUri);
    return new Promise(function (resolve, reject) {
        mongo_utils_1["default"](dbUri).then(function (m) {
            resolve({
                // Customer: getCustomerModel(m),
                // Employee: getEmployeeModel(m),
                // EmployeeTime: getEmployeeAttendanceModel(m),
                // Location: getLocationModel(m),
                // Product: getProductModel(m),
                // Revenue: getRevenueModel(m),
                // Expense: getExpenseModel(m),
                User: users_1.getUserModel(m),
                Sale: Sale_1.getSaleModel(m),
                Role: rbac_1.getRoleModel(m),
                Permission: rbac_1.getPermissionModel(m),
                KPI: kpis_1.getKPIModel(m),
                Survey: surveys_1.getSurveyModel(m),
                Inventory: Inventory_1.getInventoryModel(m),
                BusinessUnit: business_units_1.getBusinessUnitModel(m),
                Chart: charts_1.getChartModel(m),
                ChartFormat: chart_formats_1.getChartFormatModel(m),
                Dashboard: dashboards_1.getDashboardModel(m),
                WorkLog: WorkLog_1.getWorkLogModel(m),
                Expense: Expenses_1.getExpenseModel(m)
            });
        }, function (err) { return reject(err); });
    });
}
exports.getContext = getContext;
//# sourceMappingURL=app-context.js.map
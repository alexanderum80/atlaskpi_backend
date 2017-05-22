"use strict";
var Expenses_1 = require("./expenses/Expenses");
var Inventory_1 = require("./inventory/Inventory");
var surveys_1 = require("./surveys");
var _1 = require("./employees-attendance/");
var Promise = require("bluebird");
var mongo_utils_1 = require("../../mongo-utils");
var customers_1 = require("./customers");
var employees_1 = require("./employees");
var locations_1 = require("./locations");
var products_1 = require("./products");
var revenue_1 = require("./revenue");
var users_1 = require("./users");
var rbac_1 = require("../../../lib/rbac");
var kpis_1 = require("./kpis");
var business_units_1 = require("./business-units");
var chart_formats_1 = require("./chart-formats");
var charts_1 = require("./charts");
var winston = require("winston");
function getContext(dbUri) {
    winston.debug("Getting app context for: " + dbUri);
    return new Promise(function (resolve, reject) {
        mongo_utils_1["default"](dbUri).then(function (m) {
            resolve({
                Customer: customers_1.getCustomerModel(m),
                Employee: employees_1.getEmployeeModel(m),
                EmployeeTime: _1.getEmployeeAttendanceModel(m),
                Location: locations_1.getLocationModel(m),
                Product: products_1.getProductModel(m),
                Revenue: revenue_1.getRevenueModel(m),
                Expense: Expenses_1.getExpenseModel(m),
                User: users_1.getUserModel(m),
                Role: rbac_1.getRoleModel(m),
                Permission: rbac_1.getPermissionModel(m),
                KPI: kpis_1.getKPIModel(m),
                Survey: surveys_1.getSurveyModel(m),
                Inventory: Inventory_1.getInventoryModel(m),
                BusinessUnit: business_units_1.getBusinessUnitModel(m),
                Chart: charts_1.getChartModel(m),
                ChartFormat: chart_formats_1.getChartFormatModel(m)
            });
        }, function (err) { return reject(err); });
    });
}
exports.getContext = getContext;
//# sourceMappingURL=app-context.js.map
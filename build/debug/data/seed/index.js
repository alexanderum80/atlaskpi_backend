"use strict";
var accounts_1 = require("./accounts");
var customer1_1 = require("./customer1");
var roles_1 = require("./roles");
var business_units_1 = require("./business-units");
var charts_1 = require("./charts");
var seed_app_1 = require("./app/seed-app");
function seed() {
    roles_1["default"]();
    accounts_1["default"]();
    customer1_1["default"]();
    seed_app_1.seedApp();
    business_units_1["default"]();
    charts_1["default"]();
}
exports.__esModule = true;
exports["default"] = seed;
//# sourceMappingURL=index.js.map
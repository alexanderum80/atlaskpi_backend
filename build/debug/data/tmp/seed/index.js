"use strict";
var accounts_1 = require("./accounts");
var customer1_1 = require("./customer1");
var roles_1 = require("./roles");
var business_units_1 = require("./business-units");
var charts_1 = require("./charts");
var industries_1 = require("./industries");
var models_1 = require("../models");
var seed_app_1 = require("./app/seed-app");
function seed() {
    models_1.getMasterContext().then(function (masterContext) {
        var Account = masterContext.Account;
        var Industry = masterContext.Industry;
        models_1.getContext('mongodb://localhost/customer2').then(function (accountCtx) {
            roles_1["default"](accountCtx);
            accounts_1["default"](Account);
            industries_1["default"](Industry);
            customer1_1["default"](accountCtx);
            seed_app_1.seedApp(accountCtx);
            business_units_1["default"](accountCtx);
            charts_1["default"](accountCtx);
        });
    });
}
exports.__esModule = true;
exports["default"] = seed;
//# sourceMappingURL=index.js.map
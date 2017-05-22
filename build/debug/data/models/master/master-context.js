"use strict";
var Promise = require("bluebird");
var winston = require("winston");
var db_connector_1 = require("../../db-connector");
var accounts_1 = require("./accounts");
var industries_1 = require("./industries");
var masterModels = null;
function getMasterContext() {
    winston.debug("Getting master context");
    return new Promise(function (resolve, reject) {
        if (masterModels !== null) {
            resolve(masterModels);
            return;
        }
        db_connector_1["default"]().then(function () {
            masterModels = {
                Account: accounts_1.getAccountModel(),
                Industry: industries_1.getIndustryModel()
            };
            resolve(masterModels);
        }, function (err) {
            winston.error('Error connecting to master database', err);
        });
    });
}
exports.getMasterContext = getMasterContext;
//# sourceMappingURL=master-context.js.map
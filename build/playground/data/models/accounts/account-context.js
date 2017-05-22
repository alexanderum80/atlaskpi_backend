"use strict";
var Promise = require("bluebird");
var winston = require("winston");
var nova_connector_1 = require("../../nova-connector");
var Account_1 = require("./Account");
var mastertModels = null;
function getMasterContext() {
    winston.debug("Getting master context");
    return new Promise(function (resolve, reject) {
        if (mastertModels !== null) {
            resolve(mastertModels);
            return;
        }
        nova_connector_1["default"]().then(function () {
            mastertModels = {
                Account: Account_1.getAccountModel()
            };
            resolve(mastertModels);
        }, function (err) {
            winston.error('Error connecting to master database', err);
        });
    });
}
exports.getMasterContext = getMasterContext;
//# sourceMappingURL=account-context.js.map
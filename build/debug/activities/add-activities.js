"use strict";
var master_1 = require("./master");
var app_1 = require("./app");
var enforcer_1 = require("../lib/enforcer");
function addActivities() {
    var enforcerConfig = enforcer_1.getEnforcerConfig();
    enforcerConfig.addActivities([
        // master
        master_1.createAccountActivity,
        master_1.getAccountActivity,
        // app
        app_1.createUserActivity,
        app_1.userForgotPasswordActivity,
        app_1.verifyResetPasswordActivity,
        app_1.resetPasswordActivity,
        app_1.searchUsersActivity,
        app_1.updateUserActivity,
        app_1.findUserByIdActivity,
        app_1.removeUserActivity,
        // kpis
        app_1.getAllKPIsActivity,
        app_1.createKPIActivity,
        app_1.updateKPIActivity,
        app_1.removeKPIActivity,
        // businessUnits
        app_1.createBusinessUnitActivity,
        app_1.listAllBusinessUnitsActivity,
        app_1.findBusinessUnitByIdActivity,
        app_1.updateBusinessUnitByIdActivity,
        app_1.removeBusinessUnitByIdActivity,
        // chart-formats
        app_1.createChartFormatActivity,
        app_1.getAllChartFormatsActivity,
        app_1.removeChartFormatActivity,
        app_1.updateChartFormatActivity,
        app_1.getChartFormatByIdActivity,
        // charts
        app_1.getChartDataActivity,
        // dashboards
        app_1.getDashboardActivity,
    ]);
}
exports.addActivities = addActivities;
//# sourceMappingURL=add-activities.js.map
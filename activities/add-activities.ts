import { createChartActivity } from './app/charts/create-chart.activity';
import { getKpisActivity } from './app/kpis/get-kpis.activity';
import {
    createAccountActivity,
    getAccountActivity,
    getIndustriesActivity,
    accountNameAvailableActivity,
} from './master';

import {
    // users
    createUserActivity,
    userForgotPasswordActivity,
    verifyResetPasswordActivity,
    resetPasswordActivity,
    searchUsersActivity,
    updateUserActivity,
    findUserByIdActivity,
    removeUserActivity,
    verifyEnrollmentActivity,
    // kpis
    getAllKPIsActivity,
    createKPIActivity,
    updateKPIActivity,
    removeKPIActivity,

    // business unit
    createBusinessUnitActivity,
    listAllBusinessUnitsActivity,
    findBusinessUnitByIdActivity,
    updateBusinessUnitByIdActivity,
    removeBusinessUnitByIdActivity,

    // chart-formats
    createChartFormatActivity,
    getAllChartFormatsActivity,
    removeChartFormatActivity,
    updateChartFormatActivity,
    getChartFormatByIdActivity,

    // charts
    // getChartDataActivity,
    getChartActivity,
    getChartsActivity,

    // dashboards
    getDashboardActivity,
    getDashboardsActivity,
    // search
    searchActivity

} from './app';

import { getEnforcerConfig } from '../lib/enforcer';

export function addActivities() {
    let enforcerConfig = getEnforcerConfig();

    enforcerConfig.addActivities([
         // master
        createAccountActivity,
        getAccountActivity,
        getIndustriesActivity,
        accountNameAvailableActivity,

        // app
        createUserActivity,
        userForgotPasswordActivity,
        verifyResetPasswordActivity,
        resetPasswordActivity,
        searchUsersActivity,
        updateUserActivity,
        findUserByIdActivity,
        removeUserActivity,
        verifyEnrollmentActivity,

        // kpis
        getAllKPIsActivity,
        createKPIActivity,
        updateKPIActivity,
        removeKPIActivity,
        getKpisActivity,

        // businessUnits
        createBusinessUnitActivity,
        listAllBusinessUnitsActivity,
        findBusinessUnitByIdActivity,
        updateBusinessUnitByIdActivity,
        removeBusinessUnitByIdActivity,

        // chart-formats
        createChartFormatActivity,
        getAllChartFormatsActivity,
        removeChartFormatActivity,
        updateChartFormatActivity,
        getChartFormatByIdActivity,

         // charts
        // getChartDataActivity,
        getChartActivity,
        getChartsActivity,
        createChartActivity,

        // dashboards
        getDashboardActivity,
        getDashboardsActivity,

        // search
        searchActivity

    ]);
}
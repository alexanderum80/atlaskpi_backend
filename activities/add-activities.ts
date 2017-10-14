import { listAppointmentsActivity } from './app/appointments/list-appointment.activity';
import { previewChartActivity } from './app/charts/preview-chart.activity';
import { updateChartActivity } from './app/charts/update-chart.activity';
import { deleteChartActivity } from './app/charts/delete-chart.activity';
import { listChartsActivity } from './app/charts/list-charts.activity';
import { createChartActivity } from './app/charts/create-chart.activity';
import { getKpisActivity } from './app/kpis/get-kpis.activity';
import { deleteAppointmentActivity } from './app/appointments/delete-appointment.activity';
import { updateAppointmentActivity } from './app/appointments/update-appointment.activity';
import { AppointmentByIdActivity } from './app/appointments/appointment-by-id.activity';
import { AppointmentByDescriptionActivity } from './app/appointments/appointment-by-description.activity'; 
import { createAppointmentActivity } from './app/appointments/create-appointment.activity';


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
    findAllUsersActivity,
    removeUserActivity,
    verifyEnrollmentActivity,
    // kpis
    getAllKPIsActivity,
    createKPIActivity,
    updateKPIActivity,
    removeKPIActivity,
    getKpiActivity,

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
    searchActivity,

    // roles
    findAllRolesActivity,
    createRoleActivity,
    updateRoleActivity,
    removeRoleActivity,

    // permissions
    findAllPermissionsActivity,

    // log
    createAccessLogActivity,
    getAllAccessLogsActivity,

    // targets
    createTargetActivity,
    updateTargetActivity,
    deleteTargetActivity,
    findTargetActivity,
    findAllTargetsActivity,

    // device tokens
    addDeviceTokenActivity,
    removeDeviceTokenActivity,

      // data sources
    getDataSourcesActivity,

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
        findAllUsersActivity,
        removeUserActivity,
        verifyEnrollmentActivity,

        // kpis
        getAllKPIsActivity,
        createKPIActivity,
        updateKPIActivity,
        removeKPIActivity,
        getKpisActivity,
        getKpiActivity,

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
        listChartsActivity,
        deleteChartActivity,
        updateChartActivity,
        previewChartActivity,

        // dashboards
        getDashboardActivity,
        getDashboardsActivity,

        // search
        searchActivity,

        // roles
        findAllRolesActivity,
        createRoleActivity,
        updateRoleActivity,
        removeRoleActivity,

        // permissions
        findAllPermissionsActivity,

        // log
        createAccessLogActivity,
        getAllAccessLogsActivity,

        // targets
        createTargetActivity,
        updateTargetActivity,
        deleteTargetActivity,
        findTargetActivity,
        findAllTargetsActivity,

        // device tokens
        addDeviceTokenActivity,
        removeDeviceTokenActivity,

        // appointments
        createAppointmentActivity,
        AppointmentByIdActivity,
        AppointmentByDescriptionActivity,
        updateAppointmentActivity,
        deleteAppointmentActivity,
        listAppointmentsActivity,

        // data sources
        getDataSourcesActivity,

    ]);
}
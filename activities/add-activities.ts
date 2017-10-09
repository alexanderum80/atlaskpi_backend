import { listChartsByGroupActivity } from './app/charts/list-charts-by-group.activity';
import { SlideshowByGroupActivity } from './app/slideshow/slideshows-by-group.activity';
import { DeleteSlideshowActivity } from './app/slideshow/delete-slideshow.activity';
import { UpdateSlideshowActivity } from './app/slideshow/update-slideshow.activity';
import { SlideshowByIdActivity } from './app/slideshow/slideshow-by-id.activity';
import { ListSlideshowActivity } from './app/slideshow/list-slideshows.activity';
import { CreateSlideshowActivity } from './app/slideshow/create-slideshow.activity';
import { previewChartActivity } from './app/charts/preview-chart.activity';
import { updateChartActivity } from './app/charts/update-chart.activity';
import { deleteChartActivity } from './app/charts/delete-chart.activity';
import { listChartsActivity } from './app/charts/list-charts.activity';
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
        /// made by me for a test
        listChartsByGroupActivity,

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

        // slideshow
        CreateSlideshowActivity,
        ListSlideshowActivity,
        SlideshowByIdActivity,
        UpdateSlideshowActivity,
        DeleteSlideshowActivity,
        SlideshowByGroupActivity

    ]);
}
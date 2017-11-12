import { endOfDayReportActivity } from './app/reports/emd-of-day-report.activity';
import { previewWidgetActivity } from './app/widgets/preview-widget.activity';
import { createWidgetActivity } from './app/widgets/create-widget.activity';
import { getWidgetActivity } from './app/widgets/get-widget.activity';
import { listBusinessUnitsActivity } from './app/business-unit/list-business-unit.activity';
import { updateBusinessUnitActivity } from './app/business-unit/update-business-unit.activity';
import { deleteBusinessUnitActivity } from './app/business-unit/delete-business-unit.activity';
import { BusinessUnitByIdActivity } from './app/business-unit/business-unit-by-id.activity';
import { createBusinessUnitActivity } from './app/business-unit/create-business-unit.activity';
import { listChartsByGroupActivity } from './app/charts/list-charts-by-group.activity';
import { SlideshowByGroupActivity } from './app/slideshow/slideshows-by-group.activity';
import { DeleteSlideshowActivity } from './app/slideshow/delete-slideshow.activity';
import { UpdateSlideshowActivity } from './app/slideshow/update-slideshow.activity';
import { SlideshowByIdActivity } from './app/slideshow/slideshow-by-id.activity';
import { ListSlideshowActivity } from './app/slideshow/list-slideshows.activity';
import { CreateSlideshowActivity } from './app/slideshow/create-slideshow.activity';
import { getChartsByGroupActivity } from './app/charts/get-charts-by-group.activity';
import { deleteDashboardActivity } from './app/dashboards/delete-dashboard.activity';
import { updateDashboardActivity } from './app/dashboards/update-dashboard.activity';
import { getChartsGroupsActivity } from './app/charts/get-charts-groups.activity';
import { createDashboardActivity } from './app/dashboards/create-dashboard.activity';
import { listAppointmentsActivity } from './app/appointments/list-appointment.activity';
import { previewChartActivity } from './app/charts/preview-chart.activity';
import { updateChartActivity } from './app/charts/update-chart.activity';
import { deleteChartActivity } from './app/charts/delete-chart.activity';
import { listChartsActivity } from './app/charts/list-charts.activity';
import { createChartActivity } from './app/charts/create-chart.activity';
import { getKpisActivity } from './app/kpis/get-kpis.activity';
<<<<<<< HEAD

import { deleteLocationActivity } from './app/location/delete-location.activity';
import { updateLocationActivity } from './app/location/update-location.activity';
import { createLocationActivity} from './app/location/create-location.activity';
import { listLocationsActivity } from './app/location/list-locations.activity';
=======
import { deleteAppointmentActivity } from './app/appointments/delete-appointment.activity';
import { updateAppointmentActivity } from './app/appointments/update-appointment.activity';
import { AppointmentByIdActivity } from './app/appointments/appointment-by-id.activity';
import { AppointmentByDescriptionActivity } from './app/appointments/appointment-by-description.activity'; 
import { createAppointmentActivity } from './app/appointments/create-appointment.activity';

>>>>>>> origin/development

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
    RemoveTargetFromChartActivity,

    // device tokens
    addDeviceTokenActivity,
    removeDeviceTokenActivity,

      // data sources
    getDataSourcesActivity,

    // date ranges
    getDateRangesActivity,

    // widgets
    listWidgetsActivity

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
        listChartsByGroupActivity,
        getChartsGroupsActivity,
        getChartsByGroupActivity,

        // dashboards
        getDashboardActivity,
        getDashboardsActivity,
        createDashboardActivity,
        updateDashboardActivity,
        deleteDashboardActivity,

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
        RemoveTargetFromChartActivity,

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

        // business-unit
        createBusinessUnitActivity,
        BusinessUnitByIdActivity,
        updateBusinessUnitActivity,
        deleteBusinessUnitActivity,
        listBusinessUnitsActivity,

        // data sources
        getDataSourcesActivity,

        // slideshow
        CreateSlideshowActivity,
        ListSlideshowActivity,
        SlideshowByIdActivity,
        UpdateSlideshowActivity,
        DeleteSlideshowActivity,
        SlideshowByGroupActivity,

        // date ranges
        getDateRangesActivity,
<<<<<<< HEAD
=======

        // reports
        endOfDayReportActivity,
        // widgets
        listWidgetsActivity,
        getWidgetActivity,
        createWidgetActivity,
        previewWidgetActivity
>>>>>>> origin/development

        // locations
        deleteLocationActivity,
        updateLocationActivity,
        createLocationActivity,
        listLocationsActivity
    ]);
}
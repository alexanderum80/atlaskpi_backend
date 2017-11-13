import { getWidgetModel } from './widgets/widget-schema';
import { connection } from 'mongoose';
import { getSlideshowModel } from './slideshow/Slideshow';
import { getAppointmentModel } from './appointments/appointment';
import { getTargetModel } from './targets/target';
import { getAccessLogModel } from './access-log';
import { getSaleModel } from './sales/Sale';
import { getExpenseModel } from './expenses/Expenses';
import { getInventoryModel } from './inventory/Inventory';
import { getSurveyModel } from './surveys';
import { getEmployeeAttendanceModel } from './employees-attendance/';
import * as Promise from 'bluebird';
import connectToMongoDb from '../../mongo-utils';
import { IAppModels } from './app-models';
import { getBusinesUnitModel } from './business-unit/business-unit';
import { getDepartmentModel } from './departments/department';
import { getCustomerModel } from './customers';
import { getEmployeeModel } from './employees';
import { getLocationModel } from './locations';
import { getProductModel } from './products';
import { getRevenueModel } from './revenue';
import { getUserModel } from './users';
import { getRoleModel, getPermissionModel } from '../../../lib/rbac';
import { getKPIModel } from './kpis';
import { getBusinessUnitModel } from './business-units';
import { getChartFormatModel } from './chart-formats';
import { getChartModel } from './charts';
import { getDashboardModel } from './dashboards';
import { getWorkLogModel } from './work-log/WorkLog';
import { getLogModel } from './log';

import * as winston from 'winston';

export function getContext(dbUri: string): Promise<IAppModels> {
    winston.debug(`Getting app context for: ${dbUri}`);

    return new Promise<IAppModels>((resolve, reject) => {
        connectToMongoDb(dbUri).then((m) => {
            resolve({
                Connection: m,
                // Customer: getCustomerModel(m),
                // Employee: getEmployeeModel(m),
                // EmployeeTime: getEmployeeAttendanceModel(m),
                // Location: getLocationModel(m),
                // Product: getProductModel(m),
                // Revenue: getRevenueModel(m),
                // Expense: getExpenseModel(m),
                User: getUserModel(m),
                Sale: getSaleModel(m),
                Role: getRoleModel(m),
                Permission: getPermissionModel(m),
                KPI: getKPIModel(m),
                Survey: getSurveyModel(m),
                Inventory: getInventoryModel(m),
                BusinessUnit: getBusinessUnitModel(m),
                Chart: getChartModel(m),
                ChartFormat: getChartFormatModel(m),
                Dashboard: getDashboardModel(m),
                Expense: getExpenseModel(m),
                WorkLog: getWorkLogModel(m),
                LogModel: getLogModel(m),
                AccessModel: getAccessLogModel(m),
                Target: getTargetModel(m),
                SlideshowModel: getSlideshowModel(m),
                AppointmentModel: getAppointmentModel(m),
        BusinessUnitModel: getBusinessUnitModel(m),
        DepartmentModel: getDepartmentModel(m),
                Widget: getWidgetModel(m)
            });
        }, (err) => reject(err));
    });
}

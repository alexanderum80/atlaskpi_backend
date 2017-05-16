import { getSaleModel } from './sales/Sale';
import { getInventoryModel } from './inventory/Inventory';
import { getSurveyModel } from './surveys';
import { getEmployeeAttendanceModel } from './employees-attendance/';
import * as Promise from 'bluebird';
import connectToMongoDb from '../../mongo-utils';
import { IAppModels } from './app-models';

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
import { getExpenseModel } from './expenses/Expenses';

import * as winston from 'winston';

export function getContext(dbUri: string): Promise<IAppModels> {
    winston.debug(`Getting app context for: ${dbUri}`);

    return new Promise<IAppModels>((resolve, reject) => {
        connectToMongoDb(dbUri).then((m) => {
            resolve({
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
                WorkLog: getWorkLogModel(m),
                Expense: getExpenseModel(m)
            });
        }, (err) => reject(err));
    });
}

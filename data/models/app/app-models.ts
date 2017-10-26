import { IEmployeeModel } from './employees/IEmployee';
import { ISlideshowModel } from './slideshow/ISlideshow';
import { ITargetModel } from './targets/ITarget';
import { IAccessModel } from './access-log/IAccessLog';
import { IWorkLogModel } from './work-log/IWorkLog';
import { IChartModel } from './charts';
import { IInventoryModel } from './inventory/IInventory';
import { ISurveyModel } from './surveys/ISurvey';
// import { ICustomerModel } from './customers';
// import { IEmployeeModel } from './employees';
// import { IEmployeeAttendanceModel } from './employees-attendance';
// import { ILocationModel } from './locations';
// import { IProductModel } from './products';
// import { IRevenueModel } from './revenue';
// import { IExpenseModel } from './expenses';
import { IUserModel } from './users';
import { IKPIModel } from './kpis';
import { IBusinessUnitModel } from './business-units';
import { IChartFormatModel } from './chart-formats';
import { ISaleModel } from './sales';
import { IDashboardModel } from './dashboards';
import { IExpenseModel } from './expenses';
import { ILogEntryModel } from './log';
import * as mongoose from 'mongoose';

import { IRoleModel, IPermissionModel } from '../../../lib/rbac';

export interface IAppModels {
    Connection: mongoose.Connection;
    // Customer: ICustomerModel;
    // Employee: IEmployeeModel;
    // EmployeeTime: IEmployeeAttendanceModel;
    // Location: ILocationModel;
    // Product: IProductModel;
    // Revenue: IRevenueModel;
    // Expense: IExpenseModel;

    Permission: IPermissionModel;
    Role: IRoleModel;
    Sale: ISaleModel;
    User: IUserModel;
    KPI: IKPIModel;
    Survey: ISurveyModel;
    Inventory: IInventoryModel;
    BusinessUnit: IBusinessUnitModel;
    Chart: IChartModel;
    ChartFormat: IChartFormatModel;
    Dashboard: IDashboardModel;
    WorkLog: IWorkLogModel;
    Expense: IExpenseModel;
    LogModel: ILogEntryModel;
    AccessModel: IAccessModel;
    Target: ITargetModel;
    SlideshowModel: ISlideshowModel;
    EmployeeModel: IEmployeeModel;
}

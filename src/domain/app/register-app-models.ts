import {
    AccessLogs,
    Appointments,
    BusinessUnits,
    ChartFormats,
    Charts,
    Customers,
    Dashboards,
    Departments,
    Employees,
    EmployeeAttendance,
    Expenses,
    Inventory,
    KPIs,
    Locations,
    Logs,
    Sales,
    Slideshows,
    Surveys,
    Targets,
    Roles,
    Permissions,
    Users,
    Widgets,
    Worklogs,
    AppConnection
} from './';
import { Container } from 'inversify';
import { IBridgeContainer } from '../../framework/di/bridge-container';

interface IRegistrationInfo {
    name: string;
    interface: any;
    implementation: any;
}

const registrations: any[] = [
    AccessLogs,
    Appointments,
    BusinessUnits,
    ChartFormats,
    Charts,
    Customers,
    Dashboards,
    Departments,
    Employees,
    EmployeeAttendance,
    Expenses,
    Inventory,
    KPIs,
    Locations,
    Logs,
    Sales,
    Slideshows,
    Surveys,
    Targets,
    Roles,
    Permissions,
    Users,
    Widgets,
    Worklogs,
    AppConnection
];

export function registerAppModels(container: IBridgeContainer) {
    registrations.forEach(m => {
        container.registerPerWebRequest(m);
    });
}
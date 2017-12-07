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
    Worklogs
} from './';
import {  } from './access-log';
import { Container } from 'inversify';
import { BridgeContainer } from '../../framework/di/bridge-container';

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
    Worklogs
];

export function registerAppModels(container: BridgeContainer) {
    registrations.forEach(m => {
        container.registerPerWebRequest(m);
    });
}
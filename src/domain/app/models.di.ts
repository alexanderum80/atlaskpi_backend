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
    Sales,
    Slideshows,
    Surveys,
    Targets,
    Users,
    Widgets,
    WorkLog
} from './';
import {  } from './access-log';
import { Container } from 'inversify';

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
    Sales,
    Slideshows,
    Surveys,
    Targets,
    Users,
    Widgets,
    WorkLog
];

export function attachModelsToContainer(container: Container) {
    registrations.forEach(m => {
        container.bind(m.contructor.name).to(m).inSingletonScope();
    });
}
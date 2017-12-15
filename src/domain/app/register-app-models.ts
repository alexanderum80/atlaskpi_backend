import { AppConnection } from './app.connection';
import { KPIs } from './kpis/kpi.model';
import { Worklogs } from './work-log';
import { Widgets } from './widgets';
import { Users } from './security/users';
import { Permissions } from './security/permissions';
import { Roles } from './security/roles';
import { Targets } from './targets';
import { Surveys } from './surveys';
import { Slideshows } from './slideshow';
import { Sales } from './sales';
import { Logs } from './log';
import { Locations } from './location';
import { Inventory } from './inventory';
import { Expenses } from './expenses';
import { EmployeeAttendance } from './employees-attendance';
import { Employees } from './employees';
import { Departments } from './departments';
import { Dashboards } from './dashboards';
import { Customers } from './customers';
import { Charts } from './charts';
import { ChartFormats } from './chart-formats';
import { BusinessUnits } from './business-unit';
import { Appointments } from './appointments';
import { AccessLogs } from './access-log';
import { Container } from 'inversify';
import { IBridgeContainer } from '../../framework/di/bridge-container';

interface IRegistrationInfo {
    name: string;
    interface: any;
    implementation: any;
}

const registrations: any[] = [
    AppConnection,
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

export function registerAppModels(container: IBridgeContainer) {
    registrations.forEach(m => {
        console.log('Registering model: ' + m.name);
        container.registerPerWebRequest(m);
    });
}
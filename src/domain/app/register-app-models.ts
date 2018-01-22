import { Inventory } from './inventory/inventory.model';
import { CurrentAccount } from './../master/current-account';
import { IBridgeContainer } from '../../framework/di/bridge-container';
import { AccessLogs } from './access-log/access-log.model';
import { AppConnection } from './app.connection';
import { Appointments } from './appointments/appointment-model';
import { BusinessUnits } from './business-unit/business-unit-model';
import { Charts } from './charts/chart.model';
import { CurrentUser } from './current-user';
import { Customers } from './customers/customer.model';
import { Dashboards } from './dashboards/dashboard.model';
import { Departments } from './departments/department.model';
import { EmployeeAttendance } from './employees-attendance/employee-attendance.model';
import { Employees } from './employees/employee.model';
import { Expenses } from './expenses/expense.model';
import { KPIs } from './kpis/kpi.model';
import { Locations } from './location/location.model';
import { Logs } from './log/log.model';
import { Logger } from './logger';
import { Sales } from './sales/sale.model';
import { Permissions } from './security/permissions/permission.model';
import { Roles } from './security/roles/role.model';
import { Users } from './security/users/user.model';
import { Slideshows } from './slideshow/slideshow.model';
import { SocialNetwork } from './social-networks/social-network.model';
import { Surveys } from './surveys/survey.model';
import { Targets } from './targets/target.model';
import { Milestones } from './milestones/milestone.model';
import { Widgets } from './widgets/widget.model';
import { Worklogs } from './work-log/work-log.model';
import { GoogleAnalytics } from './google-analytics/google-analytics.model';
import { Tags } from './tags/tag.model';

// import { ChartFormats } from './chart-formats/chart-format.model';
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
    Charts,
    Customers,
    Dashboards,
    Departments,
    Employees,
    EmployeeAttendance,
    Expenses,
    KPIs,
    Locations,
    Logs,
    Milestones,
    Sales,
    Slideshows,
    SocialNetwork,
    Surveys,
    Tags,
    Targets,
    Roles,
    Permissions,
    Users,
    Widgets,
    Worklogs,
    Inventory,
    GoogleAnalytics
];

export function registerAppModels(container: IBridgeContainer) {
    registrations.forEach(m => {
        console.log('Registering model: ' + m.name);
        container.registerPerWebRequest(m);
    });

    container.registerPerWebRequest(Logger);
    container.registerPerWebRequest(CurrentUser);
    container.registerPerWebRequest(CurrentAccount);
}

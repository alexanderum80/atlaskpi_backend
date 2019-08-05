import { Comments } from './comments/comments.model';
import { CustomList } from './custom-list/custom-list.model';
import { FinancialActivities } from './financial-activities/financial-activity.model';
import { COGS } from './cogs/cogs.model';
import { Payments } from './payments/payment.model';
import { HelpCenter } from './help-center/help-center.model';
import { Calls } from './calls/call.model';
import { Inventory } from './inventory/inventory.model';
import { CurrentAccount } from './../master/current-account';
import { IBridgeContainer } from '../../framework/di/bridge-container';
import { AccessLogs } from './access-log/access-log.model';
import { AppConnection } from './app.connection';
import { Alerts } from './alerts/alerts.model';
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
import { Widgets } from './widgets/widget.model';
import { Worklogs } from './work-log/work-log.model';
import { GoogleAnalytics } from './google-analytics/google-analytics.model';
import { Tags } from './tags/tag.model';
import { Attachments } from './attachments/attachment-model';
import { VirtualSources } from './virtual-sources/virtual-source.model';
import { ScheduleJobs } from './schedule-job/schedule-job.model';
import { Maps } from './maps/maps.model';
import { TargetsNew } from './targetsNew/target.model';
import { ProjectedIncomes } from './projected-income/projected-income.model';
import { Funnels } from './funnels/funnel.model';

// import { ChartFormats } from './chart-formats/chart-format.model';
interface IRegistrationInfo {
    name: string;
    interface: any;
    implementation: any;
}

const registrations: any[] = [
    AppConnection,
    AccessLogs,
    Alerts,
    Appointments,
    BusinessUnits,
    Calls,
    Charts,
    Comments,
    Maps,
    Customers,
    Dashboards,
    Departments,
    Employees,
    EmployeeAttendance,
    Expenses,
    HelpCenter,
    KPIs,
    Locations,
    Logs,
    Sales,
    Slideshows,
    SocialNetwork,
    Surveys,
    Tags,
    Roles,
    Permissions,
    Users,
    Widgets,
    Worklogs,
    Inventory,
    GoogleAnalytics,
    Attachments,
    VirtualSources,
    Payments,
    COGS,
    FinancialActivities,
    ScheduleJobs,
    TargetsNew,
    ProjectedIncomes,
    CustomList,
    Funnels
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

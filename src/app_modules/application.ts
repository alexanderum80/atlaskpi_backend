import { Alerts } from '../domain/app/alerts/alerts.model';
import { GoogleSpreadSheetModule } from './google-spreadsheet/google-spreadsheet.module';
import { CallRailModule } from './integrations/callrail/callrail.module';
import { AppModule, ModuleBase } from '../framework/decorators/app-module';
import { AccessLogsModule } from './access-logs/access-logs.module';
import { AccountsModule } from './accounts/accounts.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { BusinessUnitModule } from './business-units/business-units.module';
import { ChartsModule } from './charts/charts.module';
import { CommentsModule } from './comments/comments.module';
import { ConnectorsModule } from './connectors/connectors.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { DataSourcesModule } from './data-sources/data-sources.module';
import { DateRangesModule } from './date-ranges/date-ranges.module';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { KpisModule } from './kpis/kpis.module';
import { LocationsModule } from './locations/locations.module';
import { MapsModule } from './maps/maps.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ReportsModule } from './reports/reports.module';
import { RolesModule } from './roles/roles.module';
import { SearchModule } from './search/search.module';
import { SlideshowsModule } from './slideshows/slideshow.module';
import { SocialWidgetsModule } from './social-widgets/social-widgets.module';
import { UsersModule } from './users/users.module';
import { WidgetsModule } from './widgets/widgets.module';
import { CountriesModule } from './countries/countries.module';
import { TagModule } from './tags/tags.module';
import { ActivitiesModule } from './activities/activities.module';
import { AlertsModule } from './alerts/alerts.module';
import {HelpCenterModule} from './help-centers/help-center.module';
import { TargetsNewModule } from './targetsNew/target.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DataEntryModule } from './data-entry/data-entry.module';
import { CustomListModule } from './custom-list/custom-list.module';
import { ScheduleJobModule } from './schedule-jobs/scheduleJob.module';
import { FunnelsModule } from './funnels/funnels.module';

@AppModule({
    imports: [
        AccountsModule,
        AccessLogsModule,
        ScheduleJobModule,
        AppointmentsModule,
        BusinessUnitModule,
        CallRailModule,
        ChartsModule,
        CommentsModule,
        CountriesModule,
        DashboardsModule,
        DataSourcesModule,
        DateRangesModule,
        DepartmentsModule,
        EmployeesModule,
        GoogleSpreadSheetModule,
        HelpCenterModule,
        KpisModule,
        LocationsModule,
        MapsModule,
        PermissionsModule,
        ReportsModule,
        RolesModule,
        SearchModule,
        SlideshowsModule,
        UsersModule,
        WidgetsModule,
        SocialWidgetsModule,
        TagModule,
        ConnectorsModule,
        ActivitiesModule,
        TargetsNewModule,
        NotificationsModule,
        DataEntryModule,
        CustomListModule,
        AlertsModule,
        FunnelsModule
    ]
})
export class AtlasApp extends ModuleBase { }
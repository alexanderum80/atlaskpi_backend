import { DataSourcesModule } from './data-sources/data-sources.module';
import { AppModule, ModuleBase } from '../framework/decorators/app-module';
import { AccessLogsModule } from './access-logs/access-logs.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { BusinessUnitModule } from './business-units/business-units.module';
import { ChartsModule } from './charts/charts.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { DateRangesModule } from './date-ranges/date-ranges.module';
import { EmployeesModule } from './employees/employees.module';
import { KpisModule } from './kpis/kpis.module';
import { LocationsModule } from './locations/locations.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ReportsModule } from './reports/reports.module';
import { RolesModule } from './roles/roles.module';
import { SearchModule } from './search/search.module';
import { SlideshowsModule } from './slideshows/slideshow.module';
import { SocialWidgetsModule } from './social-widgets/social-widgets.module';
import { TargetsModule } from './targets/targets.module';
import { UsersModule } from './users/users.module';
import { WidgetsModule } from './widgets/widgets.module';
import { AccountsModule } from './accounts/accounts.module';
import { MapsModule } from './maps/maps.module';


@AppModule({
    imports: [
        AccountsModule,
        AccessLogsModule,
        AppointmentsModule,
        ChartsModule,
        DashboardsModule,
        DataSourcesModule,
        DateRangesModule,
        EmployeesModule,
        KpisModule,
        LocationsModule,
        MapsModule,
        PermissionsModule,
        ReportsModule,
        RolesModule,
        SearchModule,
        SlideshowsModule,
        TargetsModule,
        UsersModule,
        WidgetsModule,
        SocialWidgetsModule
    ]
})
export class AtlasApp extends ModuleBase { }
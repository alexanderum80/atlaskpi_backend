import { GoogleSpreadSheetModule } from './google-spreadsheet/google-spreadsheet.module';
import { CallRailModule } from './integrations/callrail/callrail.module';
import { AppModule, ModuleBase } from '../framework/decorators/app-module';
import { AccessLogsModule } from './access-logs/access-logs.module';
import { AccountsModule } from './accounts/accounts.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { BusinessUnitModule } from './business-units/business-units.module';
import { ChartsModule } from './charts/charts.module';
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
import { TargetsModule } from './targets/targets.module';
import { UsersModule } from './users/users.module';
import { WidgetsModule } from './widgets/widgets.module';
import { CountriesModule } from './countries/countries.module';


@AppModule({
    imports: [
        AccountsModule,
        AccessLogsModule,
        AppointmentsModule,
        BusinessUnitModule,
        CallRailModule,
        ChartsModule,
        CountriesModule,
        DashboardsModule,
        DataSourcesModule,
        DateRangesModule,
        DepartmentsModule,
        EmployeesModule,
        GoogleSpreadSheetModule,
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
        SocialWidgetsModule,
        ConnectorsModule
    ]
})
export class AtlasApp extends ModuleBase { }
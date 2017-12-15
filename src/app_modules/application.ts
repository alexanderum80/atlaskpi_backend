import { BusinessUnitModule } from './business-units/business-units.module';
import { AppModule, ModuleBase } from '../framework/decorators/app-module';
import { AccessLogsModule } from './access-logs/access-logs.module';
import { AppointmentsModule } from './appointments/appointments.module';
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
import { TargetsModule } from './targets/targets.module';
import { UsersModule } from './users/users.module';
import { WidgetsModule } from './widgets/widgets.module';


@AppModule({
    imports: [
        AccessLogsModule,
        AppointmentsModule,
        BusinessUnitModule,
        ChartsModule,
        DashboardsModule,
        DateRangesModule,
        EmployeesModule,
        KpisModule,
        LocationsModule,
        PermissionsModule,
        ReportsModule,
        RolesModule,
        SearchModule,
        SlideshowsModule,
        TargetsModule,
        UsersModule,
        WidgetsModule
    ]
})
export class AtlasApp extends ModuleBase { }
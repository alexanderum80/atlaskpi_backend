import { DataSourcesModule } from './data-sources/data-sources.module';
import { DateRangesModule } from './date-ranges/date-ranges.module';
import { WidgetsModule } from './widgets/widgets.module';
import { UsersModule } from './users/users.module';
import { TargetsModule } from './targets/targets.module';
import { SlideshowsModule } from './slideshows/slideshow.module';
import { SearchModule } from './search/search.module';
import { RolesModule } from './roles/roles.module';
import { ReportsModule } from './reports/reports.module';
import { PermissionsModule } from './permissions/permissions.module';
import { LocationsModule } from './locations/locations.module';
import { KpisModule } from './kpis/kpis.module';
import { InventoryModule } from './inventory/inventory.module';
import { EmployeesModule } from './employees/employees.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { ChartsModule } from './charts/charts.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AccessLogsModule } from './access-logs';
import { BusinessUnitModule } from './business-units/business-units.module';
import { AppModule, ModuleBase } from '../framework';

@AppModule({
    imports: [
        AccessLogsModule,
        AppointmentsModule,
        BusinessUnitModule,
        ChartsModule,
        DashboardsModule,
        DataSourcesModule,
        DateRangesModule,
        EmployeesModule,
        InventoryModule,
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
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateDashboardMutation } from './mutations/create-dashboard.mutation';
import { DeleteDashboardMutation } from './mutations/delete-dashboard.mutation';
import { UpdateDashboardMutation } from './mutations/update-dashboard.mutation';
import { UpdateVisibleDashboardMutation } from './mutations/updatevisible-dashboard.mutation';
import { DashboardQuery } from './queries/dashboard.query';
import { DashboardsQuery } from './queries/dashboards.query';
import { DashboardByNameQuery } from './queries/dashboard-by-name.query';

@AppModule({
    mutations: [
        CreateDashboardMutation,
        DeleteDashboardMutation,
        UpdateDashboardMutation,
        UpdateVisibleDashboardMutation
    ],
    queries: [
        DashboardQuery,
        DashboardsQuery,
        DashboardByNameQuery
    ]
})
export class DashboardsModule extends ModuleBase { }
import { PreviewDashboardQuery } from './queries/preview-dashboard.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateDashboardMutation } from './mutations/create-dashboard.mutation';
import { DeleteDashboardMutation } from './mutations/delete-dashboard.mutation';
import { UpdateDashboardMutation } from './mutations/update-dashboard.mutation';
import { UpdateVisibleDashboardMutation } from './mutations/updatevisible-dashboard.mutation';
import { AddUserDashboardMutation } from './mutations/adduser-dashboard.mutation';
import { DashboardQuery } from './queries/dashboard.query';
import { DashboardsQuery } from './queries/dashboards.query';
import { DashboardByNameQuery } from './queries/dashboard-by-name.query';
import {DeleteWidgetFromDashboard} from './mutations/delete-widget-from-dashboard.mutation';
import { DeleteChartIdFromDashboardMutation } from './mutations/delete-chartId-from-dashboard.mutation';

@AppModule({
    mutations: [
        CreateDashboardMutation,
        DeleteDashboardMutation,
        UpdateDashboardMutation,
        UpdateVisibleDashboardMutation,
        AddUserDashboardMutation,
        DeleteWidgetFromDashboard,
        DeleteChartIdFromDashboardMutation,
    ],
    queries: [
        DashboardQuery,
        DashboardsQuery,
        DashboardByNameQuery,
        PreviewDashboardQuery
    ]
})
export class DashboardsModule extends ModuleBase { }
import { GetDashboardQuery, GetDashboardsQuery } from './queries';
import { CreateDashboardMutation, DeleteDashboardMutation, UpdateDashboardMutation } from './mutations';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateDashboardMutation,
        DeleteDashboardMutation,
        UpdateDashboardMutation
    ],
    queries: [
        GetDashboardQuery,
        GetDashboardsQuery
    ]
})
export class DashboardsModule extends ModuleBase { }
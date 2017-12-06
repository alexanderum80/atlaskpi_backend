import { DashboardQuery, DashboardsQuery } from './queries';
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
        DashboardQuery,
        DashboardsQuery
    ]
})
export class DashboardsModule extends ModuleBase { }
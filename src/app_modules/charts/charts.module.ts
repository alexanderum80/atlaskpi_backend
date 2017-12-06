import {
    ListChartsByGroupQuery
} from './queries/list-charts-by-group.query';
import { ChartQuery, ChartsListQuery, ChartsQuery, GetChartsByGroupQuery, GetChartsGroupQuery } from './queries';
import {
    CreateChartMutation,
    DeleteChartMutation,
    UpdateChartMutation
} from './mutations';
import {
    AppModule,
    ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateChartMutation,
        DeleteChartMutation,
        UpdateChartMutation
    ],
    queries: [
        ChartQuery,
        ChartsListQuery,
        ChartsQuery,
        GetChartsByGroupQuery,
        GetChartsGroupQuery,
        ListChartsByGroupQuery
    ],
})
export class ChartsModule extends ModuleBase {}
import {
    PreviewChartsQuery
} from './queries/preview-chart.query';
import {
    ListChartsByGroupQuery
} from './queries/list-charts-by-group.query';
import {
    ChartQuery,
    GetChartsByGroupQuery,
    GetChartsGroupQuery,
    GetChartsQuery,
    ListChartsQuery,
} from './queries';
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
        GetChartsByGroupQuery,
        GetChartsGroupQuery,
        GetChartsQuery,
        ListChartsByGroupQuery,
        ListChartsQuery,
        PreviewChartsQuery
    ],
})
export class ChartsModule extends ModuleBase {}
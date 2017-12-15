import { PreviewChartQuery } from './queries/preview-chart.query';
import { AppModule, ModuleBase } from '../../framework';
import { CreateChartMutation, DeleteChartMutation, UpdateChartMutation } from './mutations';
import { ChartQuery, ChartsListQuery, ChartsQuery, GetChartsByGroupQuery, GetChartsGroupQuery } from './queries';
import { ListChartsByGroupQuery } from './queries/list-charts-by-group.query';
import { ListChartsQuery } from './queries/list-charts.query';

@AppModule({
    mutations: [
        CreateChartMutation,
        DeleteChartMutation,
        UpdateChartMutation
    ],
    queries: [
        ChartQuery,
        ChartsListQuery,
        // ChartsQuery,
        // GetChartsByGroupQuery,
        // GetChartsGroupQuery,
        // ListChartsByGroupQuery,
        ListChartsQuery,
        PreviewChartQuery
    ],
})
export class ChartsModule extends ModuleBase {}
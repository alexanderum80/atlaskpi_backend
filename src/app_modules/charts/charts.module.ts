import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateChartMutation } from './mutations/create-chart.mutation';
import { DeleteChartMutation } from './mutations/delete-chart.mutation';
import { UpdateChartMutation } from './mutations/update-chart.mutation';
import { ChartQuery } from './queries/chart.query';
import { ChartsListQuery } from './queries/charts-list.query';
import { ListChartsQuery } from './queries/list-charts.query';
import { PreviewChartQuery } from './queries/preview-chart.query';


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
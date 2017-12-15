import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateChartMutation } from './mutations/create-chart.mutation';
import { DeleteChartMutation } from './mutations/delete-chart.mutation';
import { UpdateChartMutation } from './mutations/update-chart.mutation';
import { ChartQuery } from './queries/chart.query';
import { ChartsListQuery } from './queries/charts-list.query';
import { ChartsQuery } from './queries/charts.query';
import { GetChartsByGroupQuery } from './queries/get-charts-by-group.query';
import { GetChartsGroupQuery } from './queries/get-charts-groups.query';
import { ListChartsByGroupQuery } from './queries/list-charts-by-group.query';


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
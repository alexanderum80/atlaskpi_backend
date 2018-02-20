import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { ListChartsRunRateQuery } from './queries/list-charts-run-rate.query';
import { CreateChartRunRateMutation } from './mutations/create-run-rate.mutation';
import { DeleteChartRunRateMutation } from './mutations/delete-run-rate.mutation';
import { UpdateChartRunRateMutation } from './mutations/update-run-rate.mutation';


@AppModule({
    mutations: [
        CreateChartRunRateMutation,
        DeleteChartRunRateMutation,
        UpdateChartRunRateMutation
    ],
    queries: [
        ListChartsRunRateQuery
    ]
})
export class ChartRunRateModule extends ModuleBase { }
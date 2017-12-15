import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateTargetMutation } from './mutations/create-target.mutation';
import { RemoveTargetFromChartMutation } from './mutations/remove-target-from-chart.mutation';
import { RemoveTargetMutation } from './mutations/remove-target.mutation';
import { UpdateTargetMutation } from './mutations/update-target.mutation';
import { FindAllTargetsQuery } from './queries/find-all-targets.query';
import { FindTargetQuery } from './queries/find-target.query';


@AppModule({
    mutations: [
        CreateTargetMutation,
        RemoveTargetFromChartMutation,
        RemoveTargetMutation,
        UpdateTargetMutation
    ],
    queries: [
        FindAllTargetsQuery,
        FindTargetQuery
    ]
})
export class TargetsModule extends ModuleBase { }
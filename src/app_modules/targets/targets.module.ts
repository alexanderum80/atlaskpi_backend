import { FindAllTargetsQuery, FindTargetQuery } from './queries';
import { RemoveTargetFromChart } from './mutations/remove-target-from-chart.mutation';
import { CreateTargetMutation, RemoveTargetMutation, UpdateTargetMutation } from './mutations';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateTargetMutation,
        RemoveTargetFromChart,
        RemoveTargetMutation,
        UpdateTargetMutation
    ],
    queries: [
        FindAllTargetsQuery,
        FindTargetQuery
    ]
})
export class TargetsModule extends ModuleBase { }
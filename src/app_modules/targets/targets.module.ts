import { FindAllTargetsQuery, FindTargetQuery } from './queries';
import { CreateTargetMutation, RemoveTargetMutation, UpdateTargetMutation, RemoveTargetFromChartMutation } from './mutations';
import {
    AppModule, ModuleBase
} from '../../framework';

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
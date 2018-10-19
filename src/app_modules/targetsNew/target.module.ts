import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateTargetNewMutation } from './mutations/create-target.mutation';
import { DeleteTargetNewMutation } from './mutations/delete-target.mutation';
import { UpdateTargetNewMutation } from './mutations/update-target.mutation';
import { TargetNewByIdQuery } from './queries/target-by-id.query';
import { TargetsNewQuery } from './queries/targets.query';
import { TargetBySourceQuery } from './queries/target-by-source.query';
import { TargetByNameQuery } from './queries/target-by-name.query';


@AppModule({
    mutations: [
        CreateTargetNewMutation,
        DeleteTargetNewMutation,
        UpdateTargetNewMutation
    ],
    queries: [
        TargetNewByIdQuery,
        TargetsNewQuery,
        TargetBySourceQuery,
        TargetByNameQuery
    ]
})
export class TargetsNewModule extends ModuleBase { }
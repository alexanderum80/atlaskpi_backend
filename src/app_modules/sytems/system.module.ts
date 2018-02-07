import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { ListSystemQuery } from './queries/list-system.query';
import { CreateSystemMutation } from './mutations/create-system.mutation';
import { DeleteSystemMutation } from './mutations/delete-system.mutation';
import { UpdateSystemMutation } from './mutations/update-system.mutation';


@AppModule({
    mutations: [
        CreateSystemMutation,
        DeleteSystemMutation,
        UpdateSystemMutation
    ],
    queries: [
        ListSystemQuery
    ]
})
export class SystemModule extends ModuleBase { }
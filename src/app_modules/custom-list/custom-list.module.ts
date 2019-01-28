import { CustomListByNameQuery } from './queries/custom-list-by-name.query';
import { UpdateCustomListMutation } from './mutations/update-custom-list.mutation';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { RemoveCustomListMutation } from './mutations/remove-custom-list.mutation';
import { AddCustomListMutation } from './mutations/add-custom-list.mutation';
import { CustomListQuery } from './queries/custom-list.query';

@AppModule({
    queries: [
        CustomListQuery,
        CustomListByNameQuery
    ],
    mutations: [
        AddCustomListMutation,
        UpdateCustomListMutation,
        RemoveCustomListMutation
    ]
})
export class CustomListModule extends ModuleBase { }
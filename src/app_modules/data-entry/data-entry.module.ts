import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { RemoveDataEntryMutation } from './mutations/remove-data-entry.mutation';
import { AddDataEntryMutation } from './mutations/add-data-entry.mutation';
import { DataEntryByIdMapCollectionQuery } from './queries/data-entry-by-id.query';
import { DataEntryQuery } from './queries/data-entry-collections.query';
import { UpdateDataEntryMutation } from './mutations/update-data-entry.mutation';

@AppModule({
    queries: [
        DataEntryByIdMapCollectionQuery,
        DataEntryQuery
    ],
    mutations: [
        AddDataEntryMutation,
        RemoveDataEntryMutation,
        UpdateDataEntryMutation
    ]
})
export class DataEntryModule extends ModuleBase { }
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { RemoveDataEntryMutation } from './mutations/remove-data-entry.mutation';
import { AddDataEntryMutation } from './mutations/add-data-entry.mutation';
import { DataEntryByIdMapCollectionQuery } from './queries/data-entry-by-id.query';
import { DataEntryQuery } from './queries/data-entry.query';
import { UpdateDataEntryMutation } from './mutations/update-data-entry.mutation';
import { DataEntryCollectionQuery } from './queries/data-entry-collection.query';

@AppModule({
    queries: [
        DataEntryByIdMapCollectionQuery,
        DataEntryQuery,
        DataEntryCollectionQuery
    ],
    mutations: [
        AddDataEntryMutation,
        RemoveDataEntryMutation,
        UpdateDataEntryMutation
    ]
})
export class DataEntryModule extends ModuleBase { }
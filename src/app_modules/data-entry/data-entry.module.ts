import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { RemoveDataEntryMutation } from './mutations/remove-data-entry.mutation';
import { AddDataEntryMutation } from './mutations/add-data-entry.mutation';
import { DataEntryByIdMapCollectionQuery } from './queries/data-entry-by-id.query';
import { DataEntryQuery } from './queries/data-entry.query';
import { UpdateDataEntryMutation } from './mutations/update-data-entry.mutation';
import { DataEntryCollectionQuery } from './queries/data-entry-collection.query';
import { ProcessImportFIleQuery } from './queries/process-import-file.query';
import { RemoveRowsDataEntryMutation } from './mutations/remove-rows-data-entry.mutation';
import { UpdateDataFromFileMutation } from './mutations/update-data-from-file.mutation';
import { UpdateVirtualSourceSchemaMutation } from './mutations/update-virtualsource-schema';
import { VirtualSourceByIdQuery } from './queries/virtualsource-by-id';

@AppModule({
    queries: [
        DataEntryByIdMapCollectionQuery,
        DataEntryQuery,
        DataEntryCollectionQuery,
        ProcessImportFIleQuery,
        VirtualSourceByIdQuery
    ],
    mutations: [
        AddDataEntryMutation,
        RemoveDataEntryMutation,
        UpdateDataEntryMutation,
        RemoveRowsDataEntryMutation,
        UpdateDataFromFileMutation,
        UpdateVirtualSourceSchemaMutation
    ]
})
export class DataEntryModule extends ModuleBase { }
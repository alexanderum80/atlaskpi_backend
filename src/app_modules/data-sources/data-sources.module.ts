import { DataSourceCollectionQuery } from './queries/data-source-collection.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { DataSourcesQuery } from './queries/data-sources.query';
import { ExternalDataSourcesQuery } from './queries/external-data-sources.query';
import { GetFieldsWithDataQuery } from './queries/get-fields-with-data.query';
import { DataSourceByNameQuery } from './queries/data-source-by-name.query';

@AppModule({
    queries: [
        DataSourcesQuery,
        DataSourceCollectionQuery,
        GetFieldsWithDataQuery,
        ExternalDataSourcesQuery,
        DataSourceByNameQuery,
    ]
})
export class DataSourcesModule extends ModuleBase { }
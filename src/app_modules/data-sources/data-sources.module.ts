import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { DataSourcesQuery } from './queries/data-sources.query';
import { ExternalDataSourcesQuery } from './queries/external-data-sources.query';
import { GetFieldsWithDataQuery } from './queries/get-fields-with-data.query';

@AppModule({
    queries: [
        DataSourcesQuery,
        GetFieldsWithDataQuery,
        ExternalDataSourcesQuery
    ]
})
export class DataSourcesModule extends ModuleBase { }
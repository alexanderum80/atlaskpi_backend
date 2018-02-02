import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { DataSourcesQuery } from './queries/data-sources.query';
import { ExternalDataSourcesQuery } from './queries/external-data-sources.query';

@AppModule({
    queries: [
        DataSourcesQuery,
        ExternalDataSourcesQuery
    ]
})
export class DataSourcesModule extends ModuleBase { }
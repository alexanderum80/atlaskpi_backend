import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { DataSourcesQuery } from './queries/data-sources.query';

@AppModule({
    queries: [
        DataSourcesQuery
    ]
})
export class DataSourcesModule extends ModuleBase { }
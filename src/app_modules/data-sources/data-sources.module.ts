import { GetDataSourcesQuery } from './queries';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    queries: [
        GetDataSourcesQuery
    ]
})
export class DataSourcesModule extends ModuleBase { }
import { DataSourcesQuery } from './queries';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    queries: [
        DataSourcesQuery
    ]
})
export class DataSourcesModule extends ModuleBase { }
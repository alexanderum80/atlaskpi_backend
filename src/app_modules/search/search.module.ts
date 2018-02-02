import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { SearchQuery } from './queries/search.query';

@AppModule({
    queries: [
        SearchQuery
    ]
})
export class SearchModule extends ModuleBase { }
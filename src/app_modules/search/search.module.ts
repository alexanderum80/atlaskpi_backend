import { SearchQuery } from './queries';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    queries: [
        SearchQuery
    ]
})
export class SearchModule extends ModuleBase { }
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { TagsQuery } from './queries/tags.query';

@AppModule({
    queries: [
        TagsQuery
    ]
})
export class TagModule extends ModuleBase { }
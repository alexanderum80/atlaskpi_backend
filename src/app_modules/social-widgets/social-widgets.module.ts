import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { ListSocialWidgetsQuery } from './queries/list-social-widgets.query';

@AppModule({
    mutations: [],
    queries: [
       ListSocialWidgetsQuery
    ]
})
export class SocialWidgetsModule extends ModuleBase { }
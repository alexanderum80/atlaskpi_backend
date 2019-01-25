import { ModuleBase, AppModule } from '../../framework/decorators/app-module';
import { RenderFunnelByDefinitionQuery } from './queries/render-funnel-by-definition.query';

@AppModule({
    mutations: [
    ],
    queries: [
        RenderFunnelByDefinitionQuery
    ],
})
export class FunnelsModule extends ModuleBase {}
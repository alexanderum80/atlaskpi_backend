import { ModuleBase, AppModule } from '../../framework/decorators/app-module';
import { RenderFunnelByDefinitionQuery } from './queries/render-funnel-by-definition.query';
import { CreateFunnelMutation } from './mutations/create-funnel.mutation';
import { FunnelListQuery } from './queries/funnels.query';

@AppModule({
    mutations: [
        CreateFunnelMutation
    ],
    queries: [
        RenderFunnelByDefinitionQuery,
        FunnelListQuery
    ],
})
export class FunnelsModule extends ModuleBase {}
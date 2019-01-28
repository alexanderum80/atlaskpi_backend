import { ModuleBase, AppModule } from '../../framework/decorators/app-module';
import { RenderFunnelByDefinitionQuery } from './queries/render-funnel-by-definition.query';
import { CreateFunnelMutation } from './mutations/create-funnel.mutation';
import { FunnelListQuery } from './queries/funnels.query';
import { FunnelByIdQuery } from './queries/funnel-by-id.query';
import { UpdateFunnelMutation } from './mutations/update-funnel.mutation';

@AppModule({
    mutations: [
        CreateFunnelMutation,
        UpdateFunnelMutation
    ],
    queries: [
        RenderFunnelByDefinitionQuery,
        FunnelListQuery,
        FunnelByIdQuery
    ],
})
export class FunnelsModule extends ModuleBase {}
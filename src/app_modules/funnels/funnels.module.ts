import { ModuleBase, AppModule } from '../../framework/decorators/app-module';
import { RenderFunnelByDefinitionQuery } from './queries/render-funnel-by-definition.query';
import { CreateFunnelMutation } from './mutations/create-funnel.mutation';
import { FunnelListQuery } from './queries/funnels.query';
import { FunnelByIdQuery } from './queries/funnel-by-id.query';
import { UpdateFunnelMutation } from './mutations/update-funnel.mutation';
import { DeleteFunnelMutation } from './mutations/delete-funnel.mutation';
import { RenderFunnelByIdQuery } from './queries/render-funnel-by-id.query';
import { FunnelStageDetailsQuery } from './queries/stage-details.query';
import { FunnelStageFieldsQuery } from './queries/funnel-stage-fields.query';

@AppModule({
    mutations: [
        CreateFunnelMutation,
        UpdateFunnelMutation,
        DeleteFunnelMutation
    ],
    queries: [
        RenderFunnelByDefinitionQuery,
        FunnelListQuery,
        FunnelByIdQuery,
        RenderFunnelByIdQuery,
        FunnelStageDetailsQuery,
        FunnelStageFieldsQuery
    ],
})
export class FunnelsModule extends ModuleBase {}
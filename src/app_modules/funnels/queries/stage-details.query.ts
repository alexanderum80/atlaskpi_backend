import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { Logger } from '../../../domain/app/logger';
import { RenderFunnelByDefinitionActivity } from '../activities/render-funnel-by-definition.activity';
import { FunnelInput, RenderedFunnelType, FunnelStageDetailsResponse } from '../funnels.types';
import { FunnelsService, IFunnelStageDetails } from '../../../services/funnels.service';
import { inject, injectable } from 'inversify';
import { RenderFunnelByIdActivity } from '../activities/render-funnel-by-id.activity';
import { GetFunnelStageDetailsActivity } from '../activities/get-stage-details.activity';

@injectable()
@query({
    name: 'funnelStageDetails',
    activity: GetFunnelStageDetailsActivity,
    parameters: [
        { name: 'funnelId', type: String!, required: true },
        { name: 'stageId', type: String!, required: true },
    ],
    output: { type: FunnelStageDetailsResponse }
})
export class FunnelStageDetailsQuery implements IQuery<IFunnelStageDetails> {
    constructor(
        @inject(FunnelsService.name) private _funnelsService: FunnelsService,
        @inject(Logger.name) private _logger: Logger
    ) { }

    async run(data: { funnelId: string, stageId: string }): Promise<IFunnelStageDetails> {
        try {
            const result = await this._funnelsService.getStageDetails(data.funnelId, data.stageId);
            return result;
        } catch (e) {
            this._logger.error(e);
            return null;
        }
    }
}

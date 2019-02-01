

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { Logger } from '../../../domain/app/logger';
import { RenderFunnelByDefinitionActivity } from '../activities/render-funnel-by-definition.activity';
import { FunnelInput, RenderedFunnelType } from '../funnels.types';
import { FunnelsService } from '../../../services/funnels.service';
import { inject, injectable } from 'inversify';
import { RenderFunnelByIdActivity } from '../activities/render-funnel-by-id.activity';

@injectable()
@query({
    name: 'renderFunnelById',
    activity: RenderFunnelByIdActivity,
    parameters: [ { name: 'id', type: String, required: true }],
    output: { type: RenderedFunnelType }
})
export class RenderFunnelByIdQuery implements IQuery<RenderedFunnelType> {
    constructor(
        @inject(FunnelsService.name) private _funnelsService: FunnelsService,
        @inject(Logger.name) private _logger: Logger
    ) { }

    async run(data: { id: string }): Promise<RenderedFunnelType> {
        try {
            const rendered = await this._funnelsService.renderById(data.id);
            return rendered;
        } catch (e) {
            this._logger.error(e);
            return null;
        }
    }
}

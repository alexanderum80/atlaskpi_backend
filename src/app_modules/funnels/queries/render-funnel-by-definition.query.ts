import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { Logger } from '../../../domain/app/logger';
import { RenderFunnelByDefinitionActivity } from '../activities/render-funnel-by-definition.activity';
import { FunnelInput, RenderedFunnelType } from '../funnels.types';
import { FunnelsService } from '../../../services/funnels.service';
import { inject, injectable } from 'inversify';

@injectable()
@query({
    name: 'renderFunnelByDefinition',
    activity: RenderFunnelByDefinitionActivity,
    parameters: [
        { name: 'input', type: FunnelInput, required: true },
    ],
    output: { type: RenderedFunnelType }
})
export class RenderFunnelByDefinitionQuery implements IQuery<RenderedFunnelType> {
    constructor(
        @inject(FunnelsService.name) private _funnelsService: FunnelsService,
        @inject(Logger.name) private _logger: Logger
    ) { }

    async run(data: { input: FunnelInput }): Promise<RenderedFunnelType> {
        try {
            const rendered = await this._funnelsService.renderByDefinition(data.input);
            return rendered;
        } catch (e) {
            this._logger.error(e);
            return null;
        }
    }
}

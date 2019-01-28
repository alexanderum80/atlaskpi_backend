import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateFunnelActivity } from '../activities/create-funnel.activity';
import { FunnelInput, FunnelType, CreateFunnelResponse } from '../funnels.types';
import { Funnels } from '../../../domain/app/funnels/funnel.model';

@injectable()
@mutation({
    name: 'createFunnel',
    activity: CreateFunnelActivity,
    parameters: [
        { name: 'input', type: FunnelInput },
    ],
    output: { type: CreateFunnelResponse }
})
export class CreateFunnelMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Funnels.name) private _funnels: Funnels) {
        super();
    }

    async run(data: { input: FunnelInput }): Promise<IMutationResponse> {
        try {
            const funnel = await this._funnels.model.createFunnel(data.input);
            return { success: true, entity: funnel };
        } catch (err) {
            return {
                success: false,
                errors: [
                    {
                        field: 'funnel',
                        errors: ['There was an error creating the funnel']
                    }
                ]
            };
        }
    }

}
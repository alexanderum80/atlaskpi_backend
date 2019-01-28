import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { FunnelInput, FunnelEntityResponse } from '../funnels.types';
import { Funnels } from '../../../domain/app/funnels/funnel.model';
import { UpdateFunnelActivity } from '../activities/update-funnel.activity';

@injectable()
@mutation({
    name: 'updateFunnel',
    activity: UpdateFunnelActivity,
    parameters: [
        { name: '_id', type: String, required: true },
        { name: 'input', type: FunnelInput },
    ],
    output: { type: FunnelEntityResponse }
})
export class UpdateFunnelMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Funnels.name) private _funnels: Funnels) {
        super();
    }

    async run(data: { _id: string, input: FunnelInput }): Promise<IMutationResponse> {
        try {
            const funnel = await this._funnels.model.updateFunnel(data._id, data.input);
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
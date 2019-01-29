import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { FunnelInput, FunnelEntityResponse } from '../funnels.types';
import { Funnels } from '../../../domain/app/funnels/funnel.model';
import { UpdateFunnelActivity } from '../activities/update-funnel.activity';
import { DeleteFunnelActivity } from '../activities/delete-funnel.activity';

@injectable()
@mutation({
    name: 'deleteFunnel',
    activity: DeleteFunnelActivity,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: FunnelEntityResponse }
})
export class DeleteFunnelMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Funnels.name) private _funnels: Funnels) {
        super();
    }

    async run(data: { _id: string }): Promise<IMutationResponse> {
        try {
            const funnel = await this._funnels.model.deleteFunnel(data._id);
            return { success: true, entity: funnel };
        } catch (err) {
            return {
                success: false,
                errors: [
                    {
                        field: 'funnel',
                        errors: ['There was an error deleting the funnel']
                    }
                ]
            };
        }
    }

}
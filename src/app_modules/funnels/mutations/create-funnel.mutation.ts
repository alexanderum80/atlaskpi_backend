import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateFunnelActivity } from '../activities/create-funnel.activity';
import { FunnelInput, FunnelType } from '../funnels.types';
import { Funnels } from '../../../domain/app/funnels/funnel.model';

@injectable()
@mutation({
    name: 'createFunnel',
    activity: CreateFunnelActivity,
    parameters: [
        { name: 'input', type: FunnelInput },
    ],
    output: { type: FunnelType }
})
export class CreateFunnelMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Funnels.name) private _funnels: Funnels) {
        super();
    }

    run(data: { input: FunnelInput }): Promise<IMutationResponse> {
        return null;
    }

}
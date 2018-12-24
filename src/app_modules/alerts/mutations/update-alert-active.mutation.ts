import { AlertsService } from './../../../services/alerts.service';
import { AlertMutationResponse } from '../alerts.types';
import { inject, injectable } from 'inversify';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { UpdateAlertActiveActivity } from '../activities/update-alert-active.activity';

@injectable()
@mutation({
    name: 'updateAlertActive',
    activity: UpdateAlertActiveActivity,
    parameters: [
        { name: 'id', type: GraphQLTypesMap.String, required: true },
        { name: 'active', type: GraphQLTypesMap.Boolean, required: true }
    ],
    output: { type: AlertMutationResponse }
})
export class UpdateAlertActiveMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(AlertsService.name) private _alertsService: AlertsService
    ) {
        super();
    }

    async run(data: { id: string, active: boolean}): Promise<IMutationResponse> {
        return await this._alertsService.setActive(data.id, data.active);
    }
}
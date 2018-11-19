import { AlertsService } from './../../../services/alerts.service';
import { inject, injectable } from 'inversify';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateAlertActivity } from '../activities/update-alert.activity';
import { AlertInput, AlertMutationResponse } from '../alerts.types';
import { IAlertInfo } from '../../../domain/app/alerts/alerts';

@injectable()
@mutation({
    name: 'updateAlert',
    activity: UpdateAlertActivity,
    parameters: [
        { name: 'id', type: GraphQLTypesMap.String, required: true },
        { name: 'input', type: AlertInput }
    ],
    output: { type: AlertMutationResponse }
})
export class UpdateAlertMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(AlertsService.name) private _alertsService: AlertsService
    ) {
        super();
    }

    async run(data: { id: string, input: IAlertInfo }): Promise<IMutationResponse> {
        return await this._alertsService.updateAlert(data.id, data.input);
    }
}
import { IAlertDocument, IAlertInfo } from '../../../domain/app/alerts/alert';
import { Alerts } from '../../../domain/app/alerts/alert.model';
import { AlertInput, AlertMutationResponse } from '../alerts.types';
import { inject, injectable } from 'inversify';
import { field } from '../../../framework/decorators/field.decorator';
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
    constructor(@inject(Alerts.name) private _alert: Alerts) {
        super();
    }

    async run(data: { id: string, active: boolean}): Promise<IMutationResponse> {
        try {
            const updateAlert = await this._alert.model.updateAlertActiveField(data.id, data.active);
            return { success: true, entity: updateAlert };
        } catch (err) {
            return {
                errors: [{ field: '', errors: ['There was error updating the alert active field'] }]
            };
        }
    }
}
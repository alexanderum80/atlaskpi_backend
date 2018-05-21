import { IAlertDocument, IAlertInfo } from '../../../domain/app/alerts/alert';
import { Alerts } from '../../../domain/app/alerts/alert.model';
import { AlertInput, AlertMutationResponse } from '../alerts.types';
import { inject, injectable } from 'inversify';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import {RemoveAlertActivity} from '../activities/remove-alert.activity';

@injectable()
@mutation({
    name: 'removeAlert',
    activity: RemoveAlertActivity,
    parameters: [
        { name: 'id', type: GraphQLTypesMap.String, required: true }
    ],
    output: { type: AlertMutationResponse }
})
export class RemoveAlertMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Alerts.name) private _alert: Alerts) {
        super();
    }

    async run(data: { id: string}): Promise<IMutationResponse> {
        try {
            const removeAlert = await this._alert.model.removeAlert(data.id);
            return { success: true, entity: removeAlert };
        } catch (err) {
            return {
                errors: [{ field: '', errors: ['There was error removing the alert'] }]
            };
        }
    }
}
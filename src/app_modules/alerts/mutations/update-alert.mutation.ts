import { UpdateAlertActivity } from '../activities/update-alert.activity';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { IAlertDocument, IAlertInfo } from '../../../domain/app/alerts/alert';
import { Alerts } from '../../../domain/app/alerts/alert.model';
import { AlertInput, AlertMutationResponse } from '../alerts.types';
import { CreateAlertActivity } from '../activities/create-alert.activity';
import { inject, injectable } from 'inversify';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import * as Promise from 'bluebird';

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
    constructor(@inject(Alerts.name) private _alert: Alerts) {
        super();
    }

    run(data: { id: string, input: IAlertInfo }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._alert.model.updateAlert(data.id, data.input)
                .then((response: IAlertDocument) => {
                    resolve({ success: true, entity: response });
                    return;
                })
                .catch(err => {
                    reject({ success: false, errors: [{ field: 'alert', errors: err }] });
                    return;
                });
        });
    }
}
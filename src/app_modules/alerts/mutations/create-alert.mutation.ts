import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { IAlertDocument, IAlertInfo } from '../../../domain/app/alerts/alert';
import { Alerts } from '../../../domain/app/alerts/alert.model';
import { AlertInput, AlertMutationResponse } from '../alerts.types';
import { CreateAlertActivity } from '../activities/create-alert.activity';
import { inject, injectable } from 'inversify';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import * as Promise from 'bluebird';

@injectable()
@mutation({
    name: 'createAlert',
    activity: CreateAlertActivity,
    parameters: [
        { name: 'input', type: AlertInput }
    ],
    output: { type: AlertMutationResponse }
})
export class CreateAlertMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Alerts.name) private _alert: Alerts) {
        super();
    }

    run(data: {input: IAlertInfo }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._alert.model.createAlert(data.input)
                .then((response: IAlertDocument) => {
                    resolve({ success: true, entity: response });
                    return;
                }).catch(err => {
                    reject({ success: false, errors: [{ field: 'alert', errors: err }] });
                    return;
                });

        });
    }
}
import { Alerts } from '../../../domain/app/alerts/alert.model';
import { IAlertInfo } from '../../../domain/app/alerts/alert';
import { AlertResponse } from '../alerts.types';
import { AlertByWidgetIdActivity } from '../activities/alert-by-widget-id.activity';
import * as Promise from 'bluebird';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { inject, injectable } from 'inversify';


@injectable()
@query({
    name: 'alertByWidgetId',
    activity: AlertByWidgetIdActivity,
    parameters: [
        { name: 'id', type: String, required: true }
    ],
    output: { type: AlertResponse }
})
export class AlertByWidgetIdQuery implements IQuery<IAlertInfo> {
    constructor(@inject(Alerts.name) private _alert: Alerts) {}

    run(data: { id: string }): Promise<IAlertInfo> {
        if (!data || !data.id) {
            Promise.reject({ name: 'no id provided', message: 'no id provided'});
            return;
        }
        return this._alert.model.alertByWidgetId(data.id);
    }
}
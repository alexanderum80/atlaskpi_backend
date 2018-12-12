import { AlertResponse } from '../alerts.types';
import { inject, injectable } from 'inversify';
import { IAlertDocument } from '../../../domain/app/alerts/alerts';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { AlertsActivity } from '../activities/alerts.activity';
import { AlertsService } from '../../../services/alerts.service';

@injectable()
@query({
    name: 'alerts',
    cache: { ttl: 1800 },
    activity: AlertsActivity,
    output: { type: AlertResponse, isArray: true }
})
export class AlertsQuery implements IQuery<IAlertDocument[]> {
    constructor(
        @inject(AlertsService.name) private _alertsService: AlertsService
    ) {}

    async run(): Promise<IAlertDocument[]> {
        return this._alertsService.getAlerts();
    }
}
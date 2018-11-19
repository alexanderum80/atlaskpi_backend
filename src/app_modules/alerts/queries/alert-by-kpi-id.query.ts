import { AlertResponse } from './../alerts.types';
import { inject, injectable } from 'inversify';
import { IAlertDocument } from '../../../domain/app/alerts/alerts';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { AlertByKpiIdActivity } from '../activities/alert-by-kpi-id.activity';
import { AlertsService } from '../../../services/alerts.service';

@injectable()
@query({
    name: 'alertByKpiId',
    cache: { ttl: 1800 },
    activity: AlertByKpiIdActivity,
    parameters: [
        { name: 'id', type: String, required: true }
    ],
    output: { type: AlertResponse, isArray: true }
})
export class AlertByKpiIdQuery implements IQuery<IAlertDocument[]> {
    constructor(
        @inject(AlertsService.name)
        private _alertsService: AlertsService
    ) {}

    async run(data: { id: string }): Promise<IAlertDocument[]> {
        return this._alertsService.getAlertsByIdentifier(data.id);
    }
}
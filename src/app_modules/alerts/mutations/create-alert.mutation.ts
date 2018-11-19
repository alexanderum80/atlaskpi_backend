import { inject, injectable } from 'inversify';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateAlertActivity } from '../activities/create-alert.activity';
import { AlertInput, AlertMutationResponse } from '../alerts.types';
import { DashboardQuery } from '../../dashboards/queries/dashboard.query';
import { WidgetQuery } from '../../widgets/queries/widget.query';
import { AlertsService } from '../../../services/alerts.service';
import { IAlertInfo } from '../../../domain/app/alerts/alerts';

@injectable()
@mutation({
    name: 'createAlert',
    activity: CreateAlertActivity,
    invalidateCacheFor: [ DashboardQuery, WidgetQuery ],
    parameters: [
        { name: 'input', type: AlertInput }
    ],
    output: { type: AlertMutationResponse }
})
export class CreateAlertMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(AlertsService.name) private _alertsService: AlertsService) {
        super();
    }

    async run(data: {input: IAlertInfo }): Promise<IMutationResponse> {
        return await this._alertsService.addAlert(data.input);
    }
}
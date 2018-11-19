import { AlertsService } from './../../../services/alerts.service';
import { inject, injectable } from 'inversify';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { RemoveAlertActivity } from '../activities/remove-alert.activity';
import { AlertMutationResponse } from '../alerts.types';
import { DashboardQuery } from '../../dashboards/queries/dashboard.query';

@injectable()
@mutation({
    name: 'removeAlert',
    activity: RemoveAlertActivity,
    invalidateCacheFor: [ DashboardQuery ],
    parameters: [
        { name: 'id', type: GraphQLTypesMap.String, required: true }
    ],
    output: { type: AlertMutationResponse }
})
export class RemoveAlertMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(AlertsService.name) private _alertsService: AlertsService
    ) {
        super();
    }

    async run(data: { id: string}): Promise<IMutationResponse> {
        return this._alertsService.removeAlert(data.id);
    }
}
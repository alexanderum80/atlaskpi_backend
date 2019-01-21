import { field } from '../../../framework/decorators/field.decorator';
import { name } from 'aws-sdk/clients/importexport';
import { DeleteWidgetFromDashboardActivity } from '../activities/delete-widget-from-dashboard.activity';
import { inject, injectable } from 'inversify';

import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { DashboardResponse } from '../dashboards.types';
import { DashboardQuery } from '../queries/dashboard.query';

@injectable()
@mutation({
    name: 'deleteWidgetFromDashboard',
    activity: DeleteWidgetFromDashboardActivity,
    invalidateCacheFor: [ DashboardQuery ],
    parameters: [
        { name: 'dashboardId', type: GraphQLTypesMap.String, required: true },
        { name: 'widgetId', type: GraphQLTypesMap.String, required: true }
    ],
    output: { type: DashboardResponse}
})
export class DeleteWidgetFromDashboard extends MutationBase<IMutationResponse> {
    constructor(@inject(Dashboards.name) private _dashboards: Dashboards) {
        super();
    }

    async run(data: { dashboardId: string, widgetId: string }): Promise<IMutationResponse> {
        try {
            const dashboardDoc = await this._dashboards.model.deleteWidget(data.dashboardId, data.widgetId);
            return { success: true, entity: null };
        } catch (err) {
            return {
                success: false,
                errors: [{ field: '', errors: ['error removing widget from dashboard'] }],
                entity: null
            };
        }
    }
}
import { inject, injectable } from 'inversify';

import { IKPI } from '../../../domain/app/kpis/kpi';
import { Logger } from '../../../domain/app/logger';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { KpiService } from '../../../services/kpi.service';
import { UpdateKPIActivity } from '../activities/update-kpi.activity';
import { KPIAttributesInput, KPIMutationResponse } from '../kpis.types';
import { KpisQuery } from '../queries/kpis.query';
import { DashboardQuery } from '../../dashboards/queries/dashboard.query';
import { ChartsQuery } from '../../charts/queries/charts.query';
import { WidgetQuery } from '../../widgets/queries/widget.query';

@injectable()
@mutation({
    name: 'updateKPI',
    activity: UpdateKPIActivity,
    invalidateCacheFor: [ KpisQuery, DashboardQuery, ChartsQuery, WidgetQuery ],
    parameters: [
        { name: 'id', type: String },
        { name: 'input', type: KPIAttributesInput },
    ],
    output: { type: KPIMutationResponse }
})
export class UpdateKpiMutation extends MutationBase<IMutationResponse> {
    constructor
        (@inject(Logger.name) private _logger: Logger,
        @inject(KpiService.name) private _kpiSvc: KpiService) {
        super();
    }

    async run(data: { id: string, input: IKPI,  }): Promise<IMutationResponse> {
        try {
            const kpiDoc = await this._kpiSvc.updateKpi(data.id, data.input);
            return { success: true, entity: kpiDoc };
        } catch (e) {
            this._logger.error('Error creating kpi', e);
            return {
                errors: [{ field: '', errors: ['There was error updating the KPI'] }]
            };
        }
    }
}

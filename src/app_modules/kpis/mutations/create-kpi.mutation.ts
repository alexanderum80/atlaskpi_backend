import { inject, injectable } from 'inversify';

import { IKPI } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { field } from '../../../framework/decorators/field.decorator';
import { input } from '../../../framework/decorators/input.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateKPIActivity } from '../activities/create-kpi.activity';
import { KPIAttributesInput, KPIMutationResponse } from '../kpis.types';
import { KpiService } from '../../../services/kpi.service';
import { Logger } from '../../../domain/app/logger';



@injectable()
@mutation({
    name: 'createKPI',
    activity: CreateKPIActivity,
    parameters: [
        { name: 'input', type: KPIAttributesInput },
    ],
    output: { type: KPIMutationResponse }
})
export class CreateKpiMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(KpiService.name) private _kpiSvc: KpiService) {
        super();
    }

    async run(data: { input: IKPI }): Promise<IMutationResponse> {
        try {
            const kpiDoc = await this._kpiSvc.createKpi(data.input);
            return { success: true, entity: kpiDoc };
        } catch (e) {
            this._logger.error('Error creating kpi', e);
            return {
                errors: [{ field: '', errors: ['There was error creating the KPI'] }]
            };
        }
    }
}

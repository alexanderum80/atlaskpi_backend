import { inject, injectable } from 'inversify';

import { IKPI } from '../../../domain/app/kpis/kpi';
import { Logger } from '../../../domain/app/logger';
import { field } from '../../../framework/decorators/field.decorator';
import { input } from '../../../framework/decorators/input.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { KpiService } from '../../../services/kpi.service';
import { UpdateKPIActivity } from '../activities/update-kpi.activity';
import { KPIAttributesInput, KPIMutationResponse } from '../kpis.types';


@injectable()
@mutation({
    name: 'updateKPI',
    activity: UpdateKPIActivity,
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

        // const that = this;
        // return new Promise<IMutationResponse>((resolve, reject) => {
        //     that._kpis.model.updateKPI(data.id, data.input)
        //     .then((kpiDocument) => {
        //         resolve({entity: kpiDocument, success: true });
        //         return;
        //     })
        //     .catch((err) => resolve({ success: false, errors: [ { field: 'id', errors: [err]}] }));
        // });
    }
}

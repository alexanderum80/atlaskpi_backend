import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IKPI } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { field } from '../../../framework/decorators/field.decorator';
import { input } from '../../../framework/decorators/input.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
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
    constructor(@inject('KPIs') private _kpis: KPIs) {
        super();
    }

    run(data: { id: string, input: IKPI,  }): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._kpis.model.updateKPI(data.id, data.input)
            .then((kpiDocument) => {
                resolve({entity: kpiDocument, success: true });
                return;
            })
            .catch((err) => resolve({ success: false, errors: [ { field: 'id', errors: [err]}] }));
        });
    }
}

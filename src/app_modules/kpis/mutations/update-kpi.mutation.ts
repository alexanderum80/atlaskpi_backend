import { IKPI } from '../../../domain/app/kpis';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { KPIs } from '../../../domain';
import { KPIMutationResponse, KPIAttributesInput } from '../kpis.types';
import { UpdateKPIActivity } from '../activities';

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

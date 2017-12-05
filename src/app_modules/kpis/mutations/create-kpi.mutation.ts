import { IKPI } from '../../../domain/app/kpis';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { KPIs } from '../../../domain';
import { IMutationResponse, mutation, MutationBase } from '../../../framework';
import { CreateKPIActivity } from '../activities';
import { KPIMutationResponse, KPIAttributesInput } from '../kpis.types';


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
    constructor(@inject('KPIs') private _kpis: KPIs) {
        super();
    }

    run(data: { input: IKPI,  }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._kpis.model.createKPI(data.input).then((kpiDocument) => {
                resolve({ entity: kpiDocument, success: true });
                return;
            })
            .catch(err => resolve({ success: false, errors: [ { field: 'kpi', errors: [err]}]}));
        });
    }
}

import * as Promise from 'bluebird';
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
    constructor(@inject(KPIs.name) private _kpis: KPIs) {
        super();
    }

    run(data: { input: IKPI }): Promise<IMutationResponse> {
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

import { KPIFilterHelper } from '../../../models/app/kpis/kpi-filter.helper';
import { KPIExpressionHelper } from './../../../models/app/kpis/kpi-expression.helper';
import { IKPI } from '../../../models/app/kpis';
import { MutationBase } from '../../mutation-base';
import { IMutationResponse } from '../../../models/common';
import * as Promise from 'bluebird';
import { IIdentity, IKPIModel } from '../../..';

export class CreateKPIMutation extends MutationBase<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _KPIModel: IKPIModel) {
                    super(identity);
                }

    // log = true;
    // audit = true;

    run(data: {input: IKPI}): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._KPIModel.createKPI(data.input).then((kpiDocument) => {
                kpiDocument.expression = KPIExpressionHelper.PrepareExpressionField(kpiDocument.type, kpiDocument.expression);
                kpiDocument.filter = KPIFilterHelper.PrepareFilterField(kpiDocument.type, kpiDocument.filter);
                resolve({ entity: kpiDocument, success: true });
                return;
            })
            .catch(err => resolve({ success: false, errors: [ { field: 'kpi', errors: [err]}]}));
        });
    }
}

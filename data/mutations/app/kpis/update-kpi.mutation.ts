import { KPIFilterHelper } from './../../../models/app/kpis/kpi-filter.helper';
import { KPIExpressionHelper } from './../../../models/app/kpis/kpi-expression.helper';
import { IKPI } from './../../../models/app/kpis/IKPI';
import { MutationBase } from '../../mutation-base';
import { IMutationResponse } from '../../../models/common';
import * as Promise from 'bluebird';
import { IIdentity, IKPIModel } from '../../..';
import { IMutation, IValidationResult } from '../..';

export class UpdateKPIMutation extends MutationBase<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _KPIModel: IKPIModel) {
                    super(identity);
                }

    // log = true;
    // audit = true;

    run(data: {id: string, input: IKPI}): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._KPIModel.updateKPI(data.id, data.input)
            .then((kpiDocument) => {
                resolve({entity: kpiDocument, success: true });
                return;
            })
            .catch((err) => resolve({ success: false, errors: [ { field: 'id', errors: [err]}] }));
        });
    }
}

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

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._KPIModel.createKPI(data.input).then((kpiDocument) => {
                resolve({ entity: kpiDocument, success: true });
                return;
            })
            .catch(err => resolve({ success: false, errors: [ { field: 'kpi', errors: [err]}]}));
        });
    }
}

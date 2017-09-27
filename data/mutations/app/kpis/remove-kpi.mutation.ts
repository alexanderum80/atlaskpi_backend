import { MutationBase } from '../../mutation-base';
import { IMutationResponse } from '../../../models/common';
import * as Promise from 'bluebird';
import { IIdentity, IKPIModel } from '../../..';
import { IMutation, IValidationResult } from '../..';

export class RemoveKPIMutation extends MutationBase<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _KPIModel: IKPIModel) {
                    super(identity);
                }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!data.id) {
                return reject({ success: false,
                                errors: [ { field: 'id', errors: ['Chart not found']} ] });
            }

            that._KPIModel.findOne({ _id: data.id})
            .exec()
            .then((kpiDocument) => {
                if (!kpiDocument) {
                    reject({ success: false,
                             errors: [ { field: 'id', errors: ['Chart not found']} ] });
                    return;
                }
                kpiDocument.remove().then(() =>  {
                    resolve({ success: true });
                    return;
                });
            })
            .catch(err => reject({ success: false, errors: [ { field: 'id', errors: [err]} ] }));
        });
    }
}

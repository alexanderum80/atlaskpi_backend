import { IMutationResponse } from '../../../models/common';
import * as Promise from 'bluebird';
import { IIdentity, IKPIModel } from '../../..';
import { IMutation, IValidationResult } from '../..';

export class UpdateKPIMutation implements IMutation<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _KPIModel: IKPIModel) { }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        return this._KPIModel.updateKPI(data.id, data.data);
    }
}

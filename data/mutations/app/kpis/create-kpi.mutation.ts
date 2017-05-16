import { IMutationResponse } from '../../../models/common';
import * as Promise from 'bluebird';
import { IIdentity, IKPIModel } from '../../..';
import { IMutation, IValidationResult } from '../..';
import { IAppConfig } from '../../../../config';

export class CreateKPIMutation implements IMutation<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _KPIModel: IKPIModel) { }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        return this._KPIModel.createKPI(data.data);
    }
}

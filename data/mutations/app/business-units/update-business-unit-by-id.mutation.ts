import { IBusinessUnitModel } from '../../../models/app/business-units/IBusinessUnit';
import * as Promise from 'bluebird';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';

export class UpdateBusinessUnitByIdMutation implements IMutation<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _IBusinessUnitModel: IBusinessUnitModel) { }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        return this._IBusinessUnitModel.updateBusinessUnit(data.id, data.details);
    }
}

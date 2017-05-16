import { IBusinessUnitModel } from '../../../models/app/business-units/IBusinessUnit';
import * as Promise from 'bluebird';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import { IAppConfig } from '../../../../config';

export class CreateBusinessUnitMutation implements IMutation<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _BusinessUnitModel: IBusinessUnitModel) { }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        // details object inside graphql data object
        return this._BusinessUnitModel.createBusinessUnit(data.details);
    }
}

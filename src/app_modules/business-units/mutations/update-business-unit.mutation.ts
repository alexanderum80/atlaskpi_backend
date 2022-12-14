import { UpdateBusinessUnitInput } from './../business-units.types';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { BusinessUnits } from '../../../domain/app/business-unit/business-unit-model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateBusinessUnitActivity } from '../activities/update-business-unit.activity';
import { UpdateBusinessUnitResponse } from '../business-units.types';


@injectable()
@mutation({
    name: 'updateBusinessUnit',
    activity: UpdateBusinessUnitActivity,
    // parameters: [
    //     { name: '_id', type: String, required: true },
    //     { name: 'name', type: String, required: true },
    //     { name: 'serviceType', type: String },
    // ],
    parameters: [
        { name: 'input', type: UpdateBusinessUnitInput, required: true }
    ],
    output: { type: UpdateBusinessUnitResponse }
})
export class UpdateBusinessUnitMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(BusinessUnits.name) private _businessUnits: BusinessUnits) {
        super();
    }

    // run(data: { _id: string, name: string, serviceType: string }): Promise<IMutationResponse> {
    run(data: { input: UpdateBusinessUnitInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise < IMutationResponse > ((resolve, reject) => {
            that._businessUnits.model.updateBusinessUnit(data.input._id, data.input.name, data.input.serviceType).then(businessunit => {
                resolve({
                    success: true,
                    entity: businessunit
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [{
                        field: 'general',
                        errors: ['There was an error updating the business unit']
                    }]
                });
            });
        });
    }
}

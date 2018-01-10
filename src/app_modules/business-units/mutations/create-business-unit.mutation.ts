import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { BusinessUnits } from '../../../domain/app/business-unit/business-unit-model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateBusinessUnitActivity } from '../activities/create-business-unit.activity';
import { CreateBusinessUnitResponse } from '../business-units.types';
import { CreateBusinessUnitInput } from './../business-units.types';

@injectable()
@mutation({
    name: 'createBusinessUnit',
    activity: CreateBusinessUnitActivity,
    parameters: [
        { name: 'input', type: CreateBusinessUnitInput },
    ],
    output: { type: CreateBusinessUnitResponse }
})
export class CreateBusinessUnitMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(BusinessUnits.name) private _businessUnits: BusinessUnits) {
        super();
    }

    run(data: { input: CreateBusinessUnitInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise < IMutationResponse > ((resolve, reject) => {
            that._businessUnits.model.createNew(data.input.name, data.input.serviceType).then(businessunit => {
                resolve({
                    success: true,
                    entity: businessunit
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [{
                        field: 'general',
                        errors: ['There was an error creating the business unit']
                    }]
                });
            });
        });
    }
}

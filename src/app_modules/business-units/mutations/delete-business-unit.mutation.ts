import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { BusinessUnits } from '../../../domain/app/business-unit/business-unit-model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteBusinessUnitActivity } from '../activities/delete-business-unit.activity';
import { DeleteBusinessUnitResponse } from '../business-units.types';


@injectable()
@mutation({
    name: 'deleteBusinessUnit',
    activity: DeleteBusinessUnitActivity,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: DeleteBusinessUnitResponse }
})
export class DeleteBusinessUnitMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(BusinessUnits.name) private _businessUnits: BusinessUnits) {
        super();
    }

    run(data: { _id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise < IMutationResponse > ((resolve, reject) => {
            that._businessUnits.model.deleteBusinessUnit(data._id).then(businessunit => {
                resolve({
                    success: businessunit !== null,
                    errors: businessunit !== null ? [] : [{
                        field: 'general',
                        errors: ['Business Unit not found']
                    }]
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [{
                        field: 'general',
                        errors: ['There was an error deleting the business unit']
                    }]
                });
            });
        });
    }
}

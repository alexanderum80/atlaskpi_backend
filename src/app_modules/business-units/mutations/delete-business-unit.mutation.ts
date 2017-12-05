
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { MutationBase, mutation, IMutationResponse } from '../../../framework';
import { BusinessUnits } from '../../../domain';
import { DeleteBusinessUnitResponse } from '../business-units.types';
import { DeleteBusinessUnitActivity } from '../activities';

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
    constructor(@inject('BusinessUnits') private _businessUnits: BusinessUnits) {
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

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { MutationBase, mutation, IMutationResponse } from '../../../framework';
import { BusinessUnits } from '../../../domain';
import { CreateBusinessUnitResponse } from '../business-units.types';
import { CreateBusinessUnitActivity } from '../activities';

@injectable()
@mutation({
    name: 'createBusinessUnit',
    activity: CreateBusinessUnitActivity,
    parameters: [
        { name: 'name', type: String, required: true },
        { name: 'serviceType', type: String },
    ],
    output: { type: CreateBusinessUnitResponse }
})
export class CreateBusinessUnitMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('BusinessUnits') private _businessUnits: BusinessUnits) {
        super();
    }

    run(data: { name: string, serviceType: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise < IMutationResponse > ((resolve, reject) => {
            that._businessUnits.model.createNew(data.name, data.serviceType).then(businessunit => {
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

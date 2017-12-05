
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { MutationBase, mutation, IMutationResponse } from '../../../framework';
import { BusinessUnits } from '../../../domain';
import { UpdateBusinessUnitResponse } from '../business-units.types';
import { UpdateBusinessUnitActivity } from '../activities';

@injectable()
@mutation({
    name: 'updateBusinessUnit',
    activity: UpdateBusinessUnitActivity,
    parameters: [
        { name: '_id', type: String, required: true },
        { name: 'name', type: String, required: true },
        { name: 'serviceType', type: String },
    ],
    output: { type: UpdateBusinessUnitResponse }
})
export class UpdateBusinessUnitMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('BusinessUnits') private _businessUnits: BusinessUnits) {
        super();
    }

    run(data: { _id: string, name: string, serviceType: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise < IMutationResponse > ((resolve, reject) => {
            that._businessUnits.model.updateBusinessUnit(data._id, data.name, data.serviceType).then(businessunit => {
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

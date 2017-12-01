import {
    IBusinessUnitModel
} from '../business-unit.model';
import {
    MutationBase,
    IIdentity,
    IMutationResponse,
    IMutation,
    IValidationResult
} from '../../../framework';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class CreateBusinessUnitMutation extends MutationBase < IMutationResponse > {
    constructor(
        public identity: IIdentity,
        private _BusinessUnitModel: IBusinessUnitModel) {
        super(identity);
    }

    run(data): Promise < IMutationResponse > {
        const that = this;

        return new Promise < IMutationResponse > ((resolve, reject) => {
            that._BusinessUnitModel.createNew(data.name, data.serviceType).then(businessunit => {
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
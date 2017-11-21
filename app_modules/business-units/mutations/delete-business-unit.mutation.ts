import {
    IBusinessUnitModel
} from '../business-unit.model';
import {
    MutationBase,
    IIdentity,
    IMutationResponse,
    IMutation,
    IValidationResult
} from '../../common';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class DeleteBusinessUnitMutation extends MutationBase < IMutationResponse > {
    constructor(
        public identity: IIdentity,
        private _BusinessUnitModel: IBusinessUnitModel) {
        super(identity);
    }

    run(data): Promise < IMutationResponse > {
        const that = this;

        return new Promise < IMutationResponse > ((resolve, reject) => {
            that._BusinessUnitModel.deleteBusinessUnit(data._id).then(businessunit => {
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
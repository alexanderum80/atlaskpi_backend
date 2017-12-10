import { IBusinessUnitModel } from '../../../models/app/business-unit/IBusinessUnit';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class CreateBusinessUnitMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _BusinessUnitModel: IBusinessUnitModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._BusinessUnitModel.createNew(data.input.name, data.input.serviceType).then(businessunit => {
                resolve({
                    success: true,
                    entity: businessunit
                });
           }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error creating the business unit']
                        }
                    ]
                });
           });
        });
    }
}

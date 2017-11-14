import { IBusinesUnitModel } from '../../../models/app/business-unit/IBusinessUnit';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class UpdateBusinessUnitMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _BusinessUnitModel: IBusinesUnitModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._BusinessUnitModel.updateBusinessUnit(data._id, data.name, data.serviceType).then(businessunit => {
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
                            errors: ['There was an error updating the business unit']
                        }
                    ]
                });
           });
        });
    }
}

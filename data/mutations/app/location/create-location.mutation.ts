import { ILocationModel } from '../../../models/app/location/ILocation';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class CreateLocationMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _LocationModel: ILocationModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._LocationModel.createNew(
                data.name,
                data.description,
                data.alias,
                data.businessunits,
                data.latitude,
                data.longitude,
                data.operhours,
                data.street,
                data.city,
                data.state,
                data.zip
                ).then(location => {
                resolve({
                    success: true,
                    entity: location
                });
           }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error creating the location']
                        }
                    ]
                });
           });
        });
    }
}
import { ILocationModel, ILocation } from '../../../models/app/location/ILocation';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class UpdateLocationMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _LocationModel: ILocationModel) {
            super(identity);
        }

    run(data: {id: string, input: ILocation}): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._LocationModel.updateLocation(data.id, data.input).then(location => {
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
                            errors: ['There was an error updating the location']
                        }
                    ]
                });
           });
        });
    }
}
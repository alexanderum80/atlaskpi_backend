import { ILocationModel } from '../../../models/app/location/ILocation';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class DeleteLocationMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _LocationModel: ILocationModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._LocationModel.deleteLocation(data._id).then(location => {
                resolve({
                    success: location !== null,
                    errors: location !== null ? [] : [{ field: 'general', errors: ['Location not found'] }]
                });
           }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error deleting the location']
                        }
                    ]
                });
           });
        });
    }
}
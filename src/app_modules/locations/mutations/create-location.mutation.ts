import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ILocationInput } from '../../../domain/app/location/location';
import { Locations } from '../../../domain/app/location/location.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateLocationActivity } from '../activities/create-location.activity';
import { CreateLocationResponse, LocationInput } from '../locations.types';


@injectable()
@mutation({
    name: 'createLocation',
    activity: CreateLocationActivity,
    parameters: [
        { name: 'input', type: LocationInput },
    ],
    output: { type: CreateLocationResponse }
})
export class CreateLocationMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Locations.name) private _locations: Locations) {
        super();
    }

    run(data: { input: ILocationInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._locations.model.createLocation(data.input).then(location => {
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

import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ILocationInput } from '../../../domain/app/location/location';
import { Locations } from '../../../domain/app/location/location.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateLocationActivity } from '../activities/update-location.activity';
import { LocationInput, UpdateLocationResponse } from '../locations.types';
import { field } from '../../../framework/decorators/field.decorator';

@injectable()
@mutation({
    name: 'updateLocation',
    activity: UpdateLocationActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'input', type: LocationInput },
    ],
    output: { type: UpdateLocationResponse }
})
export class UpdateLocationMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Locations.name) private _locations: Locations) {
        super();
    }

    run(data: { id: string, input: ILocationInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._locations.model.updateLocation(data.id, data.input).then(location => {
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

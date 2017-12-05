
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Locations, ILocation } from '../../../domain';
import { UpdateLocationResponse, ILocationInput } from '../locations.types';
import { UpdateLocationActivity } from '../activities';

@injectable()
@mutation({
    name: 'updateLocation',
    activity: UpdateLocationActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'input', type: ILocationInput },
    ],
    output: { type: UpdateLocationResponse }
})
export class UpdateLocationMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Locations') private _locations: Locations) {
        super();
    }

    run(data: { id: string, input: ILocation,  }): Promise<IMutationResponse> {
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

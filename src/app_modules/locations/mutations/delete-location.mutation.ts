import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Locations } from '../../../domain/app/location/location.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteLocationActivity } from '../activities/delete-location.activity';
import { DeleteLocationResponse } from '../locations.types';


@injectable()
@mutation({
    name: 'deleteLocation',
    activity: DeleteLocationActivity,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: DeleteLocationResponse }
})
export class DeleteLocationMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Locations.name) private _locations: Locations) {
        super();
    }

    run(data: { _id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._locations.model.deleteLocation(data._id).then(location => {
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

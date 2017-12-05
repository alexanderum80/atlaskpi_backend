
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Locations } from '../../../domain';
import { DeleteLocationResponse } from '../locations.types';
import { DeleteLocationActivity } from '../activities';

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
    constructor(@inject('Locations') private _locations: Locations) {
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

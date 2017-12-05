
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Locations } from '../../../domain';
import { CreateLocationResponse, ILocationInput } from '../locations.types';
import { CreateLocationActivity } from '../activities';

@injectable()
@mutation({
    name: 'createLocation',
    activity: CreateLocationActivity,
    parameters: [
        { name: 'input', type: ILocationInput },
    ],
    output: { type: CreateLocationResponse }
})
export class CreateLocationMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Locations') private _locations: Locations) {
        super();
    }

    run(data: { input: ILocationInput,  }): Promise<IMutationResponse> {
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

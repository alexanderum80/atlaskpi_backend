import { Location } from '../locations.types';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ILocationDocument } from '../../../domain';
import { Locations } from '../../../domain/app/location/location.model';
import { query, QueryBase } from '../../../framework';
import { ListLocationsActivity } from '../activities';

@injectable()
@query({
    name: 'locations',
    activity: ListLocationsActivity,
    output: { type: Location, isArray: true }
})
export class LocationsQuery implements IQuery<ILocationDocument[]> {
    constructor(@inject('Locations') private _locations: Locations) {
        
    }

    run(data: { id: string }): Promise<ILocationDocument[]> {
        return this._locations.model.locations();
    }
}

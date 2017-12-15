import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ILocationDocument } from '../../../domain/app/location/location';
import { Locations } from '../../../domain/app/location/location.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListLocationsActivity } from '../activities/list-locations.activity';
import { Location } from '../locations.types';



@injectable()
@query({
    name: 'locations',
    activity: ListLocationsActivity,
    output: { type: Location, isArray: true }
})
export class LocationsQuery implements IQuery<ILocationDocument[]> {
    constructor(@inject('Locations') private _locations: Locations) { }

    run(data: { id: string }): Promise<ILocationDocument[]> {
        return this._locations.model.locations();
    }
}

import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ILocationDocument } from '../../../domain/app/location/location';
import { Locations } from '../../../domain/app/location/location.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { LocationByIdActivity } from '../activities/location-by-id.activity';
import { Location } from '../locations.types';



@injectable()
@query({
    name: 'locationById',
    activity: LocationByIdActivity,
    parameters: [
        { name: 'id', type: String, required: true }
    ],
    output: { type: Location, isArray: true }
})
export class LocationByIdQuery implements IQuery<ILocationDocument> {
    constructor(@inject('Locations') private _locations: Locations) { }

    run(data: { id: string }): Promise<ILocationDocument> {
        return this._locations.model.locationById(data.id);
    }
}

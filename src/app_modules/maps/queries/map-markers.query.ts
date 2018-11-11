import { inject, injectable } from 'inversify';

import { TypeMap } from '../../../domain/app/sales/sale';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetMapDetailsActivity } from '../activities/get-map-details.activity';
import { MapMarker, MapMarkerGroupingInput } from '../map.types';
import { MapMarkerService } from '../../../services/map-marker.service';
import { input } from '../../../framework/decorators/input.decorator';

export interface IMapMarker {
    name: string;
    lat: number;
    lng: number;
    color: string;
    value: number;
}

@injectable()
@query({
    name: 'mapMarkers',
    activity: GetMapDetailsActivity,
    parameters: [
        { name: 'type', type: GraphQLTypesMap.String },
        { name: 'input', type: MapMarkerGroupingInput }
    ],
    output: { type: MapMarker, isArray: true }
})
export class MapMarkersQuery implements IQuery < IMapMarker[] > {
    constructor(@inject(MapMarkerService.name) private _mapMarkerSvc: MapMarkerService) { }

    async run(data: { type: TypeMap, input: MapMarkerGroupingInput }): Promise < IMapMarker[] > {
        const dateRange = JSON.parse(data.input.dateRange);
        if (dateRange.predefined === '' || data.input.grouping === '') {
            return;
        }

        return await this._mapMarkerSvc.getMapMarkers(data.type, data.input);
    }
}

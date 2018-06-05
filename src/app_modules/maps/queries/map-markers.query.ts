import { inject, injectable } from 'inversify';
import { chain, Dictionary, isEmpty, keyBy, isString } from 'lodash';

import { ISaleByZip, ISaleByZipGrouping, TypeMap } from '../../../domain/app/sales/sale';
import { Sales } from '../../../domain/app/sales/sale.model';
import { IZipToMapDocument } from '../../../domain/master/zip-to-map/zip-to-map';
import { ZipsToMap } from '../../../domain/master/zip-to-map/zip-to-map.model';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { NULL_CATEGORY_REPLACEMENT } from '../../charts/queries/charts/ui-chart-base';
import { GetMapDetailsActivity } from '../activities/get-map-details.activity';
import { MapMarker, MapMarkerGroupingInput, MapMarkerItemList } from '../map.types';
import {MapMarkerService} from '../../../services/map-marker.service';

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
        return await this._mapMarkerSvc.getMapMarkers(data.type, data.input);
    }
}

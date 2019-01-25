import { inject, injectable } from 'inversify';
import { isArray } from 'lodash';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { MapMarkerService } from '../../../services/map-marker.service';
import { Logger } from './../../../domain/app/logger';
import { ListMapsActivity } from './../activities/list-maps.activity';

@injectable()
@query({
    name: 'listMaps',
    activity: ListMapsActivity,
    output: { type: String, isArray: true }
})
export class ListMapsQuery implements IQuery<String[]> {
    constructor(
        @inject(MapMarkerService.name) private _mapsService: MapMarkerService,
        @inject(Logger.name) private _logger: Logger
    ) { }

    async run(): Promise<string[]> {
        const maps = await this._mapsService.listMaps();

        return maps.map(m => JSON.stringify(m));
    }

    // private getMarkers(mapdata: any, dateRange: string, groupings: string[], kpi: string ): Promise<Object> {
    //     return new Promise<Object>((resolve, reject) => {
    //         const markerGroupings  = {
    //             dateRange: JSON.stringify(dateRange),
    //             grouping: groupings,
    //             kpi: kpi
    //         };
    //         this._mapsService.getMapMarkers(TypeMap.customerAndZip, markerGroupings)
    //             .then(markersList => {
    //                 const response = {
    //                     _id : mapdata.id,
    //                     title: mapdata.title,
    //                     subtitle: mapdata.subtitle,
    //                     group: mapdata.group,
    //                     groupings: mapdata.groupings,
    //                     kpi: mapdata.kpi,
    //                     size: mapdata.size,
    //                     dashboards: mapdata.dashboards,
    //                     dateRange: <any>mapdata.dateRange,
    //                     markers: markersList,
    //                     createdBy: mapdata.createdBy,
    //                     createdDate: mapdata.createdDate,
    //                     updatedBy: mapdata.updatedBy,
    //                     updatedDate: mapdata.updatedDate
    //                 };
    //                 resolve(JSON.stringify(response));
    //                 return;
    //             })
    //             .catch(err => {
    //                 this._logger.error(err);
    //                 reject(err);
    //             });
    //     });
    // }
}

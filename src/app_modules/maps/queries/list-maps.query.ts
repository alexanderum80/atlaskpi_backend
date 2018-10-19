import { isArray } from 'lodash';
import { DateRange } from './../../../domain/common/date-range';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { Logger } from './../../../domain/app/logger';
import { ListMapsActivity } from './../activities/list-maps.activity';
import { MapMarkerGroupingInput, } from '../map.types';
import { MapMarkerService } from '../../../services/map-marker.service';
import { TypeMap } from '../../../domain/app/sales/sale';

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

    run(data: { }): Promise<string[]> {
        const that = this;
        const mapsPromises: Promise<Object>[] = [];
        return new Promise<string[]>((resolve, reject) => {
            that._mapsService.listMaps()
                .then(maps => {
                    maps.map(m => {
                        mapsPromises.push(this.getMarkers(m, m.dateRange, m.groupings, m.kpi));
                    });
                    Promise.all(mapsPromises).then(res => {
                        resolve(<any>res);
                    })
                    .catch(err => {
                        reject(err);
                    });
                })
                .catch(err => {
                    that._logger.error(err);
                    reject(err);
                });
        });
    }

    private getMarkers(mapdata: any, dateRange: string, groupings: string, kpi: string ): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            const markerGroupings  = {
                dateRange: JSON.stringify(dateRange),
                grouping: groupings,
                kpi: kpi
            };
            this._mapsService.getMapMarkers(TypeMap.customerAndZip, markerGroupings)
                .then(markersList => {
                    const response = {
                        _id : mapdata.id,
                        title: mapdata.title,
                        subtitle: mapdata.subtitle,
                        group: mapdata.group,
                        groupings: mapdata.groupings,
                        kpi: mapdata.kpi,
                        size: mapdata.size,
                        dashboards: mapdata.dashboards,
                        dateRange: <any>mapdata.dateRange,
                        markers: markersList
                    };
                    resolve(JSON.stringify(response));
                    return;
                })
                .catch(err => {
                    this._logger.error(err);
                    reject(err);
                });
        });
    }
}

import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';
import { IChartInput } from '../../../domain/app/charts/chart';
import { query } from '../../../framework/decorators/query.decorator';
import { GetMapActivity } from '../activities/get-map.activity';
import { IQuery } from './../../../framework/queries/query';
import { Logger } from '../../../domain/app/logger';
import { MapsService } from '../../../services/maps.service';
import { MapMarkerService } from '../../../services/map-marker.service';
import { TypeMap } from '../../../domain/app/sales/sale';

@injectable()
@query({
    name: 'map',
    activity: GetMapActivity,
    parameters: [
        { name: 'id', type: String }
    ],
    output: { type: String }
})
export class MapQuery implements IQuery<String> {
    constructor(
        @inject(MapMarkerService.name) private _mapMarkerService: MapMarkerService,
        @inject(MapsService.name) private _mapsService: MapsService,
        @inject('Logger') private _logger: Logger
    ) { }

    run(data: {id: string }): Promise<string> {
        const that = this;
        return new Promise<string>((resolve, reject) => {
            that._mapsService.getMapById(data.id)
                .then(m => {
                    const many: any = m;
                    this.getMarkers(m, many.dateRange, many.groupings)
                    .then(res => {
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

    private getMarkers(mapdata: any, dateRange: string, groupings: string ): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            const markerGroupings  = {
                dateRange: JSON.stringify(dateRange),
                grouping: groupings
            };
            this._mapMarkerService.getMapMarkers(TypeMap.customerAndZip, markerGroupings)
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

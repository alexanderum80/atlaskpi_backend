import { inject, injectable } from 'inversify';
import {difference, isString }  from 'lodash';
import { Logger } from '../domain/app/logger';
import {IChartTop} from '../domain/common/top-n-record';
import { Dashboards } from './../domain/app/dashboards/dashboard.model';
import { KPIs } from './../domain/app/kpis/kpi.model';
import {IChartDateRange} from './../domain/common/date-range';
import { Maps } from '../domain/app/maps/maps.model';
import { MapAttributesInput } from '../app_modules/maps/map.types';
import { attachMapToDashboards,
    detachMapFromDashboards,
    detachMapFromAllDashboards
} from '../app_modules/maps/mutations/common';

export interface IRenderChartOptions {
    chartId?: string;
    dateRange?: [IChartDateRange];
    top?: IChartTop;
    filter?: string;
    frequency?: string;
    groupings?: string[];
    comparison?: string[];
    xAxisSource?: string;
    isFutureTarget?: boolean;
    isDrillDown?: boolean;
    originalFrequency?: string;
}


@injectable()
export class MapsService {

    constructor(
        @inject(Maps.name) private _maps: Maps,
        @inject(Dashboards.name) private _dashboards: Dashboards,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(Logger.name) private _logger: Logger,
    ) { }

    public getMapById(id: string): Promise<Object> {

        return new Promise<Object>((resolve, reject) => {
            this._maps.model
                .findOne({ _id: id })
                .then(mapDocument => {
                    if (!mapDocument) {
                        return reject({ field: 'id', errors: ['Map not found']});
                    }
                    return resolve(mapDocument);
                })
                .catch(e => reject(e));
        });
    }

    public getMapByTitle(title: string): Promise<String> {
        const that = this;
        return new Promise<String>((resolve, reject) => {
            that._maps.model
            .findOne({ title: title })
            .then(map => {
                if (!map) {
                    return resolve(undefined);
                } else {
                    return resolve(JSON.stringify(map));
                }
            })
            .catch(err => {
                return reject(err);
            });
        });
    }

    public deleteMap(id: string): Promise<String> {
        const that = this;
        return new Promise<String>((resolve, reject) => {
            if (!id ) {
                return reject({ field: 'id', errors: ['Map not found']});
            }

            that._maps.model.findOne({ _id: id})
            .exec()
            .then((map) => {
                if (!map) {
                    reject({ field: 'id', errors: ['Map not found']});
                    return;
                }

                detachMapFromAllDashboards(that._dashboards.model, map._id)
                .then(() => {
                    map.remove().then(() =>  {
                        resolve(<string>map.toObject());
                        return;
                    });
                })
                .catch(err => reject(err));
            });
        });
    }

    public updateMap(id: string, input: MapAttributesInput): Promise<String> {
        const that = this;
        return new Promise<String>((resolve, reject) => {
            // resolve kpis
            that._kpis
                .model
                .find({ _id: { $in: input.kpi }})
                .then((kpis) => {
                if (!kpis) {
                    that._logger.error('one or more kpi not found:' + id);
                    reject({ field: 'kpis', errors: ['one or more kpis not found']});
                    return;
                }

                // resolve dashboards the map is in
                that._dashboards.model.find( {'maps.id': { $in: [id]}})
                    .then((mapDashboards) => {
                        // update the map
                        that._maps.model.updateMap(id, input)
                            .then((map) => {
                                const currentDashboardIds = mapDashboards.map(d => String(d._id));
                                const toRemoveDashboardIds = difference(currentDashboardIds, input.dashboards);
                                const toAddDashboardIds = difference(input.dashboards, currentDashboardIds);
                                let mapObj;
                                if (isString(map)) {
                                    mapObj = JSON.parse(<any>map);
                                } else {
                                    mapObj = map;
                                }
                                detachMapFromDashboards(that._dashboards.model, toRemoveDashboardIds, mapObj)
                                .then(() => {
                                    attachMapToDashboards(that._dashboards.model, this._maps.model , toAddDashboardIds, mapObj)
                                    .then(() => {
                                        resolve(JSON.stringify(map));
                                        return;
                                    })
                                    .catch(err => reject({ field: 'dashboard', errors: ['could not attach map to dashboard']}));
                                })
                                .catch(err => reject({ field: 'dashboard', errors: ['could not detach map from dashboard']}));
                            })
                            .catch(err => reject({ field: 'map', errors: ['could not update map']}));
                    })
                    .catch(err => reject({ field: 'dashboard', errors: ['could get the dashboard list']}));
                })
                .catch(err => reject({ field: 'kpi', errors: ['could get the kpi list']}));
        });
    }
}
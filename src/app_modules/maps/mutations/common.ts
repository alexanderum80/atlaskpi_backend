import { isString } from 'lodash';

import { IDashboardModel } from '../../../domain/app/dashboards/dashboard';
import { IMapModel } from '../../../domain/app/maps/maps';

export function detachMapFromAllDashboards(dashboardModel: IDashboardModel, mapId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({ maps: { $in: [mapId]}},
                              { $pull: { maps: { id: mapId }}},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export function detachMapFromDashboards(dashboardModel: IDashboardModel, dashboardsIds: string[], mapId: string): Promise<boolean> {
    if (!dashboardsIds || dashboardsIds.length < 1 ) { return Promise.resolve(true); }
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({_id: { $in: dashboardsIds}},
                              { $pull: { maps: { id: mapId }}},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export async function attachMapToDashboards(dashboardModel: IDashboardModel, mapModel: IMapModel , dashboardsIds: string[], map: any): Promise<boolean> {
    if (!dashboardsIds || dashboardsIds.length < 1 ) { return Promise.resolve(true); }
    // Here I must ad on each dashboard
    // the fields id & position of the new map
    // Calculating the new position
    const values = [];
    const allMaps = await mapModel.find({});
    const allDashboards = await  dashboardModel.find({'_id': { $in: dashboardsIds}});
    const theMaps = [];
    let tempMap;
    allDashboards.forEach(d => {
        if (d.maps.length > 0) {
            d.maps.map(m => {
                if (isString(m)) {
                    tempMap = JSON.parse(<any>m);
                } else {
                    tempMap = m;
                }
                theMaps.push({
                    id: tempMap.id,
                    position: tempMap.position,
                    size: allMaps.find(a => a.id === tempMap.id).size
                });
            });
            const mapsFiltered = theMaps.filter(f => f.size === map.size);
            const positions: number[] = mapsFiltered.map(c => (<any>c).position);
            const newPosition = positions.length === 0 ? 1 :  Math.max.apply(null, <any>positions) + 1;
            values.push({
                dashboard_Id: d.id,
                map_Id: map.id,
                position: newPosition
            });
        } else {
            values.push({
                dashboard_Id: d.id,
                map_Id: map.id,
                position: 1
            });
        }
    });
    const searchPromises: Promise<Object>[] = [];
    values.map(v => {
        searchPromises.push(attachMapToDashboard(dashboardModel, v));
    });
    Promise.all(searchPromises).then(res => {
        const result = res.find(r => r === false);
        Promise.resolve(result ? false : true);
    });
}

export function attachMapToDashboard(dashboardModel: IDashboardModel, values: any): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({_id: values.dashboard_Id},
                            { $push: {
                                maps: { id: values.map_Id, position: values.position }
                                }
                            }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}
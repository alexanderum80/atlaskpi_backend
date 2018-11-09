import * as Promise from 'bluebird';

import { IDashboardModel } from '../../../domain/app/dashboards/dashboard';

export function detachFromAllDashboards(dashboardModel: IDashboardModel, mapId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({ maps: { $in: [mapId]}},
                              { $pull: { maps: mapId }},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export function detachFromDashboards(dashboardModel: IDashboardModel, dashboardsIds: string[], mapId: string): Promise<boolean> {
    if (!dashboardsIds || dashboardsIds.length < 1 ) { return Promise.resolve(true); }
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({_id: { $in: dashboardsIds}},
                              { $pull: { maps: mapId }},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export function attachToDashboards(dashboardModel: IDashboardModel, dashboardsIds: string[], mapId: string): Promise<boolean> {
    if (!dashboardsIds || dashboardsIds.length < 1 ) { return Promise.resolve(true); }
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({_id: { $in: dashboardsIds}},
                              { $push: { maps: mapId }},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}
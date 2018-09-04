import * as Promise from 'bluebird';

import { IDashboardModel } from '../../../domain/app/dashboards/dashboard';

export function detachFromAllDashboards(dashboardModel: IDashboardModel, widgetId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({ widgets: { $in: [widgetId]}},
                              { $pull: { widgets: widgetId }},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export function detachFromDashboards(dashboardModel: IDashboardModel, dashboardsIds: string[], widgetId: string): Promise<boolean> {
    if (!dashboardsIds || dashboardsIds.length < 1 || (dashboardsIds[0] === '' && dashboardsIds.length === 1)) { return Promise.resolve(true); }
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({_id: { $in: dashboardsIds}},
                              { $pull: { widgets: widgetId }},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export function attachToDashboards(dashboardModel: IDashboardModel, dashboardsIds: string[], widgetId: string): Promise<boolean> {
    if (!dashboardsIds || dashboardsIds.length < 1 || (dashboardsIds[0] === '' && dashboardsIds.length === 1)) { return Promise.resolve(true); }
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({_id: { $in: dashboardsIds}},
                              { $push: { widgets: widgetId }},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}
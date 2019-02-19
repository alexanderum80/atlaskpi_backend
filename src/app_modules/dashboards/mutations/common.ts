
import { IDashboardModel } from '../../../domain/app/dashboards/dashboard';

export function detachFromAllDashboards(dashboardModel: IDashboardModel, chartId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({ charts: { $in: [chartId]}},
                              { $pull: { charts: { id: chartId }}},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export function detachUserFromAllDashboards(dashboardModel: IDashboardModel, userId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({ users: { $in: [userId]}},
                              { $pull: { users: userId }},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export function detachFromDashboards(dashboardModel: IDashboardModel, dashboardsIds: string[], chartId: string): Promise<boolean> {
    if (!dashboardsIds || dashboardsIds.length < 1 ) { return Promise.resolve(true); }
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({_id: { $in: dashboardsIds}},
                              { $pull: { charts: { id: chartId }}},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}




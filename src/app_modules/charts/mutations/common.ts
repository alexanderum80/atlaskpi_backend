
import { IDashboardModel } from '../../../domain/app/dashboards/dashboard';
import { ICommentsModel } from '../../../domain/app/comments/comments';

export function detachChartFromAllDashboards(dashboardModel: IDashboardModel, chartId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({ charts: { $elemMatch: {id: chartId}}},
                              { $pull: { charts: { id: chartId }}},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export function detachChartFromDashboards(dashboardModel: IDashboardModel, dashboardsIds: string[], chartId: string): Promise<boolean> {
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

export function deleteCommentsFromChart(commentModel: ICommentsModel, chartId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        commentModel.deleteMany({chart: chartId}).exec()
        .then(comments => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export async function attachChartToDashboards(dashboardModel: IDashboardModel, dashboardsIds: string[], chart: any): Promise<boolean> {
    if (!dashboardsIds || dashboardsIds.length < 1 ) { return Promise.resolve(true); }
    // Here I must ad on each dashboard
    // the fields id & position of the new chart
    // Calculating the new position
    const values = [];
    const allDashboards = await  dashboardModel.find({'_id': { $in: dashboardsIds}});
    allDashboards.forEach(d => {
        if (d.charts.length > 0) {
            const positions: number[] = d.charts.map(c => (<any>c).position);
            const newPosition = Math.max.apply(null, <any>positions) + 1;
            values.push({
                dashboard_Id: d.id,
                chart_Id: chart.id,
                position: newPosition
            });
        } else {
            values.push({
                dashboard_Id: d.id,
                chart_Id: chart.id,
                position: 1
            });
        }
    });
    const searchPromises: Promise<Object>[] = [];
    values.map(v => {
        searchPromises.push(this.attachChartToDashboard(dashboardModel, v));
    });
    Promise.all(searchPromises).then(res => {
        const result = res.find(r => r === false);
        Promise.resolve(result ? false : true);
    });
}

export function attachChartToDashboard(dashboardModel: IDashboardModel, values: any): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({_id: values.dashboard_Id},
                            { $push: {
                                charts: { id: values.chart_Id, position: values.position }
                                }
                            }).exec()
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

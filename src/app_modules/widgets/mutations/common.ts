import { isString } from 'lodash';

import { IDashboardModel } from '../../../domain/app/dashboards/dashboard';
import { IWidgetModel } from '../../../domain/app/widgets/widget';

export function detachFromAllDashboards(dashboardModel: IDashboardModel, widgetId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({ widgets: { $in: [widgetId]}},
                              { $pull: { widgets: { id: widgetId }}},
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
                              { $pull: { widgets: { id: widgetId }}},
                              { multi: true }).exec()
        .then(dashboards => {
            resolve(true);
            return;
        })
        .catch(err => reject(err));
    });
}

export async function attachWidgetToDashboards(dashboardModel: IDashboardModel, widgetModel: IWidgetModel , dashboardsIds: string[], widget: any): Promise<boolean> {
    if (!dashboardsIds || dashboardsIds.length < 1 || (dashboardsIds[0] === '' && dashboardsIds.length === 1)) { return Promise.resolve(true); }
    // Here I must ad on each dashboard
    // the fields id & position of the new map
    // Calculating the new position
    const values = [];
    const allWidgets = await widgetModel.find({});
    const allDashboards = await  dashboardModel.find({'_id': { $in: dashboardsIds}});
    const theWidgets = [];
    let tempWidget;
    allDashboards.forEach(d => {
        if (d.widgets.length > 0) {
            d.widgets.map(m => {
                if (isString(m)) {
                    tempWidget = JSON.parse(<any>m);
                } else {
                    tempWidget = m;
                }
                theWidgets.push({
                    id: tempWidget.id,
                    position: tempWidget.position,
                    size: allWidgets.find(a => a.id === tempWidget.id).size
                });
            });
            const widgetsFiltered = theWidgets.filter(f => f.size === widget.size);
            const positions: number[] = widgetsFiltered.map(c => (<any>c).position);
            const newPosition = positions.length === 0 ? 1 : Math.max.apply(null, <any>positions) + 1;
            values.push({
                dashboard_Id: d.id,
                widget_Id: widget.id,
                position: newPosition
            });
        } else {
            values.push({
                dashboard_Id: d.id,
                widget_Id: widget.id,
                position: 1
            });
        }
    });
    const searchPromises: Promise<Object>[] = [];
    values.map(v => {
        searchPromises.push(attachWidgetToDashboard(dashboardModel, v));
    });
    Promise.all(searchPromises).then(res => {
        const result = res.find(r => r === false);
        return Promise.resolve(result ? false : true);
    });
}

export function attachWidgetToDashboard(dashboardModel: IDashboardModel, values: any): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {
        dashboardModel.update({_id: values.dashboard_Id},
                            { $push: {
                                widgets: { id: values.widget_Id, position: values.position }
                                }
                            }).exec()
        .then(dashboards => {
            return resolve(true);
        })
        .catch(err => reject(err));
    });
}
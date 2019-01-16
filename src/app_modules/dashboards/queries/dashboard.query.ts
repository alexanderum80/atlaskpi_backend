import { IWidgetDocument } from './../../../domain/app/widgets/widget';
import * as Promise from 'bluebird';
import * as console from 'console';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';

import { CurrentUser } from '../../../domain/app/current-user';
import { IDashboard } from '../../../domain/app/dashboards/dashboard';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { Logger } from '../../../domain/app/logger';
import { IUIWidget } from '../../../domain/app/widgets/ui-widget-base';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { WidgetsService } from '../../../services/widgets.service';
import { ChartQuery } from '../../charts/queries/chart.query';
import { GetDashboardActivity } from '../activities/get-dashboard.activity';
import { Dashboard } from '../dashboards.types';
import { SocialWidgetsService } from '../../../services/social-widgets.service';
import { MapQuery } from '../../maps/queries/map.query';

@injectable()
@query({
    name: 'dashboard',
    cache: { ttl: 1800 },
    activity: GetDashboardActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: Dashboard }
})
export class DashboardQuery implements IQuery<IDashboard> {
    constructor(
        @inject(CurrentUser.name) private _user: CurrentUser,
        @inject('Logger') private _logger: Logger,
        @inject(WidgetsService.name) private _widgetService: WidgetsService,
        @inject(SocialWidgetsService.name) private _socialwidgetService: SocialWidgetsService,
        @inject(ChartQuery.name) private _chartQuery: ChartQuery,
        @inject(MapQuery.name) private _mapQuery: MapQuery,
        @inject(Dashboards.name) private _dashboards: Dashboards) { }

    run(data: { id: string }): Promise<IDashboard> {
        let that = this;

        if (!this._user) {
            // this._logger.error('No user logged in at this point, so not dashboard can be generated');
            return Promise.resolve(null);
        }

        const user = that._user.get();

        // lets prepare the query for the dashboards
        let query = { };

        if (isEmpty(user) || isEmpty(user.roles)) {
            return Promise.resolve({} as any);
        }

        if (user && user.roles && user.roles.find(r => r.name === 'owner')) {
            query = { _id: data.id };
        } else {
            query = { _id: data.id,
                      $or: [
                          { owner: user._id },
                          { users: { $in: [user._id]} }
                    ]
                };
        }

        return new Promise<IDashboard>((resolve, reject) => {
            that._dashboards.model
                .findOne(query)
                .populate(
                    {
                        path: 'charts.id',
                        populate: { path: 'kpis' }
                    }
                )
                .populate('widgets.id')
                .then(dashboard => {

                    if (!dashboard) {
                        // that._logger.debug('dashbord doenst exists, or not enought permissions to see it.');
                        // reject('not found');
                        return resolve(null);
                    }

                    const dashboardElementsPromises = { };
                    // process widgets
                    const widgetsElements: IWidgetDocument[] = dashboard.widgets.map(w => {
                        let widget = (<any>w).id;
                        widget['position'] = (<any>w).position;
                        return widget;
                    });

                    dashboardElementsPromises['widgets'] = that._widgetService.materializeWidgetDocuments(widgetsElements);

                    // process social widgets
                    const socialwidgetsElements = dashboard.socialwidgets.map(w => {
                        let swidget = [];
                        swidget['id'] = (<any>w).id;
                        swidget['position'] = (<any>w).position;
                        return swidget;
                    });

                    let swidgetsPromises = socialwidgetsElements.map(sw => {
                        return that._socialwidgetService.getSocialWidgetsById((<any>sw).id, (<any>sw).position);
                    });

                    // process maps
                    const mapsElements = dashboard.maps.map(m => {
                        let map = [];
                        map['id'] = (<any>m).id;
                        map['position'] = (<any>m).position;
                        return map;
                    });

                    let mapsPromises = mapsElements.map(m => { return that._mapQuery.run({ id: (<any>m).id, position: (<any>m).position}); });

                    // process charts
                    const chartsElements = dashboard.charts.map(m => {
                        let chart = (<any>m).id;
                        chart['position'] = (<any>m).position;
                        return chart;
                    });
                    let chartPromises = chartsElements.map(c => {
                        let chartobj = that._chartQuery.run({ id: c.id, position: c.position } as any);
                        chartobj['position'] = c.position;
                        return chartobj;
                    });

                    dashboardElementsPromises['charts'] = Promise.all(chartPromises);

                    dashboardElementsPromises['maps'] = Promise.all(mapsPromises);

                    dashboardElementsPromises['socialwidgets'] = Promise.all(swidgetsPromises);

                    Promise.props(dashboardElementsPromises).then((elements: { widgets: IUIWidget[], socialwidgets: string[] , charts: string[], maps: string[]}) => {
                        let response = {};

                        const widgetsAsString = elements.widgets.map(w => JSON.stringify(w));
                        Object.assign(response, dashboard.toObject(), { widgets: widgetsAsString, socialwidgets: elements.socialwidgets , maps: elements.maps ,  charts: elements.charts });
                        resolve(<any>response);
                    }).catch(e => {
                        reject(e);
                    });
                });
        });
    }
}

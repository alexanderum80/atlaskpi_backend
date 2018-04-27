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

@injectable()
@query({
    name: 'dashboard',
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
        @inject(ChartQuery.name) private _chartQuery: ChartQuery,
        @inject(Dashboards.name) private _dashboards: Dashboards) { }

    run(data: { id: string,  }): Promise<IDashboard> {
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
                        path: 'charts',
                        populate: { path: 'kpis' }
                    }
                )
                .populate('widgets')
                .then(dashboard => {

                    if (!dashboard) {
                        // that._logger.debug('dashbord doenst exists, or not enought permissions to see it.');
                        reject('not found');
                        return;
                    }

                    const dashboardElementsPromises = { };
                    // process widgets
                    dashboardElementsPromises['widgets'] = that._widgetService.materializeWidgetDocuments(<any>dashboard.widgets);

                    // process charts
                    let chartPromises = dashboard.charts.map(c => {
                        return that._chartQuery.run({ id: (<any>c)._id } as any);
                    });

                    dashboardElementsPromises['charts'] = Promise.all(chartPromises);

                    Promise.props(dashboardElementsPromises).then((elements: { widgets: IUIWidget[], charts: string[]}) => {
                        let response = {};
                        console.dir(elements.widgets);
                        const widgetsAsString = elements.widgets.map(w => JSON.stringify(w));
                        Object.assign(response, dashboard.toObject(), { widgets: widgetsAsString, charts: elements.charts });
                        resolve(<any>response);
                    }).catch(e => {
                        reject(e);
                    });
                });
        });
    }
}

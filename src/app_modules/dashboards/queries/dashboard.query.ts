import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { Winston } from 'winston';

import { Dashboards } from '../../../domain';
import { IDashboard } from '../../../domain/app/dashboards';
import { IUserDocument } from '../../../domain/app/security/users';
import { IUIWidget } from '../../../domain/app/widgets/ui-widget-base';
import { query, QueryBase } from '../../../framework';
import { WidgetsService } from '../../../services/widgets.service';
import { ChartQuery } from '../../charts/queries/chart.query.new';
import { GetDashboardActivity } from '../activities';
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
        @inject('CurrentUser') private _user: IUserDocument,
        @inject('logger') private _logger: Winston,
        @inject('WidgetService') private _widgetService: WidgetsService,
        @inject('ChartQuery') private _chartQuery: ChartQuery,
        @inject('Dashboards') private _dashboards: Dashboards) {
        
    }

    run(data: { id: String,  }): Promise<IDashboard> {
        let that = this;

        if (!this._user) {
            this._logger.error('No user logged in at this point, so not dashboard can be generated');
            return Promise.resolve(null);
        }

        // lets prepare the query for the dashboards
        let query = { };
        if (this._user.roles.find(r => r.name === 'owner')) {
            query = { _id: data.id };
        } else {
            query = { _id: data.id, $or: [ { owner: that._user._id }, { users: { $in: [that._user._id]} } ]};
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
                        that._logger.debug('dashbord doenst exists, or not enought permissions to see it.');
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
                    }).catch(e => reject(e));
                });
        });
    }
}

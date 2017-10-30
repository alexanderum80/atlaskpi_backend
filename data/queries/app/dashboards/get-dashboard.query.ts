import { stringify } from 'querystring';
import { IUIWidget } from './../../../models/app/widgets/ui-widget-base';
import { WidgetsService } from './../../../services/widgets/widgets.service';
import { QueryBase } from '../../query-base';
import { GetChartQuery } from '../charts';
import { ChartFactory } from '../charts/charts/chart-factory';
import { FrequencyTable } from '../../../models/common/frequency-enum';
import { FrequencyEnum, IDateRange } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IDashboard, IDashboardModel } from '../../../models';
import { IUserDocument } from '../../../models/app/users/IUser';
import * as logger from 'winston';

export class GetDashboardQuery extends QueryBase<IDashboard> {

    constructor(public identity: IIdentity, private _ctx: IAppModels, private _user: IUserDocument) {
        super(identity);
    }

    // log = true;
    // audit = true;

    run(data: { id: string }): Promise<IDashboard> {
        let that = this;

        if (!this._user) {
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
            that._ctx.Dashboard
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
                        logger.debug('dashbord doenst exists, or not enought permissions to see it.');
                        reject('not found');
                        return;
                    }

                    const widgetService = new WidgetsService(that._ctx);

                    const dashboardElementsPromises = { };
                    // process widgets
                    dashboardElementsPromises['widgets'] = widgetService.materializeWidgetDocuments(<any>dashboard.widgets);

                    // process charts
                    let chartPromises = dashboard.charts.map(c => {
                        let chartQuery = new GetChartQuery(that.identity, that._ctx, that._user);
                        return chartQuery.run({ id: (<any>c)._id });
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

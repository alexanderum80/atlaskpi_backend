import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { CurrentUser } from './../../../domain/app/current-user';
import { IDashboard } from './../../../domain/app/dashboards/dashboard';
import { Logger } from './../../../domain/app/logger';
import { IQuery } from './../../../framework/queries/query';
import { WidgetsService } from './../../../services/widgets.service';
import { ChartQuery } from './../../charts/queries/chart.query';
import { PreviewDashboardActivity } from './../activities/preview-dashboard.activity';
import { DashboardInput, Dashboard } from './../dashboards.types';

@injectable()
@query({
    name: 'previewDashboard',
    activity: PreviewDashboardActivity,
    parameters: [
        { name: 'input', type: DashboardInput },
    ],
    output: { type: Dashboard }
})
export class PreviewDashboardQuery implements IQuery<IDashboard> {
    constructor(
        @inject(CurrentUser.name) private _user: CurrentUser,
        @inject(Logger.name) private _logger: Logger,
        @inject(WidgetsService.name) private _widgetService: WidgetsService,
        @inject(ChartQuery.name) private _chartQuery: ChartQuery
    ) { }

    async run(data: { input: DashboardInput }): Promise<IDashboard> {
        const that = this;
        try {
            const dashboardElementsPromises = { };
            dashboardElementsPromises['widgets'] = Bluebird.map(
                <any>data.input.widgets,
                (w: string) => that._widgetService.getWidgetById(w)
            );

            dashboardElementsPromises['charts'] = Bluebird.map(
                <any>data.input.charts,
                (c: string) => that._chartQuery.run({ id: c } as any)
            );

            const elements = await Bluebird.props(dashboardElementsPromises) as any;

            const response = {...data.input} as any;
            response.widgets = elements.widgets.map(w => JSON.stringify(w));
            response.charts  = elements.charts;

            return response;
       }
       catch (err) {
            that._logger.error(err);
            return null;
       }
    }
}

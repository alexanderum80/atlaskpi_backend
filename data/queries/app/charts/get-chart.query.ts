import { IChartMetadata } from './charts/chart-metadata';
import { FrequencyTable } from '../../../models/common/frequency-enum';
import { FrequencyEnum, IDateRange } from '../../../models/common';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IChart, IChartDocument, IGetChartInput } from '../../../models/app/charts';
import { IAppModels } from '../../../models/app/app-models';
import { IDashboardDocument, IDashboardModel } from '../../../models/app/dashboards';

import { ChartFactory } from './charts/chart-factory';
import { KpiFactory } from '../kpis/kpi.factory';
import { getGroupingMetadata } from './chart-grouping-map';
import * as logger from 'winston';

export class GetChartQuery implements IQuery<string> {

    constructor(public identity: IIdentity, private _ctx: IAppModels) { }

    // log = true;
    // audit = true;

    run(data: { chart?: IChart, id?: string, input?: IGetChartInput }): Promise<string> {
        logger.debug('running get chart query for id:' + data.id);

        let that = this;

        // in order for this query to make sense I need either a chart definition or an id
        if (!data.chart && !data.id && !data.input) {
            return Promise.reject('An id or a chart definition is needed');
        }

        let chartPromise = data.chart ?
                Promise.resolve(data.chart)
                : this._getChart(data.id);

        return new Promise<string>((resolve, reject) => {
            chartPromise.then(chart => {

                    if (!chart) {
                        return reject(null);
                    }

                    let uiChart = ChartFactory.getInstance(chart);
                    let kpi = KpiFactory.getInstance(chart.kpis[0], that._ctx);
                    let groupings = getGroupingMetadata(chart, data.input ? data.input.groupings : []);

                    let frequency = FrequencyTable[(data.input && data.input.frequency) ? data.input.frequency : chart.frequency];
                    let definitionParameters: IChartMetadata = {
                        filter: (data.input && data.input.filter)  ? data.input.filter : chart.filter,
                        frequency: frequency,
                        groupings: groupings,
                        xAxisSource: (data.input && data.input.xAxisSource) ? data.input.xAxisSource : chart.xAxisSource
                    };

                    if (data.input && data.input.dateRange) {
                        definitionParameters.dateRange = data.input.dateRange;
                    }

                    uiChart.getDefinition(kpi, definitionParameters).then((definition) => {
                        logger.debug('chart definition received for id: ' + data.id);
                        chart.chartDefinition = definition;
                        resolve(JSON.stringify(chart));
                    }).catch(e => {
                        console.error(e);
                        reject(e);
                    });
                });
        });
    }

    private _getChart(id: string): Promise<IChart> {
        const that = this;

        return new Promise<IChart>((resolve, reject) => {
            this._ctx.Chart
                .findOne({ _id: id })
                .populate({
                    path: 'kpis',
                }).then(chartDocument => {
                    that._resolveDashboards(chartDocument).then((dashboards) => {
                        const chart: any = chartDocument.toObject();
                        chart.dashboards = dashboards;
                        resolve(chart);
                        return;
                    });
                })
                .catch(e => reject(e));
        });
    }

    private _resolveDashboards(chart): Promise<IDashboardDocument[]> {
        const that = this;
        return new Promise<IDashboardDocument[]>((resolve, reject) => {
            that._ctx.Dashboard.find( { charts: { $in: [chart._id] }}).exec()
                .then((dashboards) => resolve(dashboards))
                .catch(err => reject(err));
        });
    }
}

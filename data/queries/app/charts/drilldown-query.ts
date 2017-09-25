import { QueryBase } from '../../query-base';
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

export class DrillDownQuery extends QueryBase<string> {
    constructor(public identity,
                private _ctx: IAppModels) {
                    super(identity);
                }

    run(data: { chart?: IChart, id?: string, data?: any }): Promise<string> {
        logger.debug('running get chart query for id:' + data.id);

        let that = this;

        // in order for this query to make sense I need either a chart definition or an id
        if (!data.chart && !data.id && !data.data) {
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
                    let groupings = getGroupingMetadata(chart, data.data ? data.data.groupings : []);

                    let frequency = FrequencyTable[(data.data && data.data.frequency) ? data.data.frequency : chart.frequency];
                    let definitionParameters: IChartMetadata = {
                        filter: (data.data && data.data.filter)  ? data.data.filter : chart.filter,
                        frequency: frequency,
                        groupings: groupings,
                        xAxisSource: (data.data && data.data.xAxisSource) ? data.data.xAxisSource : chart.xAxisSource
                    };

                    if (data.data && data.data.dateRange) {
                        definitionParameters.dateRange = data.data.dateRange;
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
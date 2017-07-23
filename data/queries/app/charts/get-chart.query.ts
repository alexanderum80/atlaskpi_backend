import { IChartMetadata } from './charts/chart-metadata';
import { FrequencyTable } from '../../../models/common/frequency-enum';
import { FrequencyEnum, IDateRange } from '../../../models/common';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IChart, IChartDocument } from '../../../models/app/charts';
import { IAppModels } from '../../../models/app/app-models';

import { ChartFactory } from './charts/chart-factory';
import { KpiFactory } from '../kpis/kpi.factory';
import { getGroupingMetadata } from './chart-grouping-map';

export class GetChartQuery implements IQuery<string> {

    constructor(public identity: IIdentity, private _ctx: IAppModels) { }

    // log = true;
    // audit = true;

    run(data: { chart?: IChart, id?: string, dateRange?: { from: string, to: string}, filter?: any, frequency?: string, groupings?: string[], xAxisSource?: string }): Promise<string> {
        let that = this;

        // in order for this query to make sense I need either a chart definition or an id
        if (!data.chart && !data.id) {
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
                    let groupings = getGroupingMetadata(chart, data.groupings);

                    let frequency = FrequencyTable[data.frequency ? data.frequency : chart.frequency];
                    let definitionParameters: IChartMetadata = {
                        filter: data.filter ? data.filter : chart.filter,
                        frequency: frequency,
                        groupings: groupings,
                        xAxisSource: data.xAxisSource
                    };

                    if (data.dateRange) {
                        definitionParameters.dateRange = {
                            predefined: null,
                            custom: {
                                from: new Date(data.dateRange.from),
                                to: new Date(data.dateRange.to)
                            }
                        };
                    }

                    uiChart.getDefinition(kpi, definitionParameters).then((definition) => {
                        chart.chartDefinition = definition;
                        resolve(JSON.stringify(chart));
                    }).catch(e => reject(e));
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
                }).then(chartDocument => resolve(chartDocument))
                .catch(e => reject(e));
        });
    }
}

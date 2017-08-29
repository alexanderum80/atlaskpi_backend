import { getGroupingMetadata } from './';
import { IChartMetadata } from './charts';
import * as logger from 'winston';
import { IGetDataOptions } from '../kpis/kpi-base';
import { FrequencyTable } from '../../../models/common';
import { KpiFactory } from '../kpis';
import { ChartFactory } from './charts/chart-factory';
import { IQuery } from '../..';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';

export class DrillDownQuery implements IQuery<string> {
    constructor(public identity,
                private _ctx: IAppModels) {}

    run(data: any): Promise<string> {
        const that = this;
        let drilldownPromise = this._getdrillDown(data.id);
        let _detailData = data.data;

        return new Promise<string>((resolve, reject) => {
            drilldownPromise.then((chart) => {
                if (!chart) {
                    return reject(null);
                }

                let uiChart = ChartFactory.getInstance(chart);
                let kpi = KpiFactory.getInstance(chart.kpis[0], that._ctx);
                let frequency = FrequencyTable[(_detailData.frequency)];
                let groupings = getGroupingMetadata(chart, chart.groupings || []);
                console.log('DrillDownQuery groupings: ' + groupings);
                console.log('DrillDownQuery frequency: ' + frequency);

                let definitionParameters: IChartMetadata = {
                    filter: chart.filter,
                    frequency: _detailData.frequency,
                    dateRange: _detailData.dateRange,
                    groupings: groupings,
                    xAxisSource: chart.xAxisSource
                };

                uiChart.getDefinition(kpi, definitionParameters).then((response) => {
                    logger.debug('chart definition received for id: ' + response.id);
                    chart.chartDefinition = response;
                    resolve(JSON.stringify(chart));
                }).catch((err) => {
                    console.log(err);
                    reject(err);
                })
            });
        });
    }

    private _getdrillDown(id: string): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            return that._ctx.Chart.findById(id)
                .populate({
                    path: 'kpis',
                })
                .then((response) => {
                    resolve(response);
                }).catch((err) => {
                    reject(err);
                });
        });
    }
}
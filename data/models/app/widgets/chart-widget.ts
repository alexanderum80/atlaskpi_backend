import { getGroupingMetadata } from '../../../queries/app/charts/chart-grouping-map';
import { IChartMetadata } from './../../../queries/app/charts/charts/chart-metadata';
import { FrequencyTable } from './../../common/frequency-enum';
import { IChart } from './../charts/IChart';
import { IAppModels } from '../app-models';
import { ChartFactory } from './../../../queries/app/charts/charts/chart-factory';
import { UIChartBase } from '../../../queries/app/charts/charts';
import { KpiFactory } from '../../../queries/app/kpis/kpi.factory';
import { KpiBase } from '../../../queries/app/kpis/kpi-base';
import { IWidget, IWidgetMaterializedFields } from './';
import { IUIWidget, UIWidgetBase } from './ui-widget-base';
import * as Promise from 'bluebird';

export class ChartWidget extends UIWidgetBase implements IUIWidget {
    chart: string; // stringified representation of an IChart with its definition

    constructor(widget: IWidget, ctx: IAppModels) {
        super(widget, ctx);
        if (!this.chartWidgetAttributes || !this.chartWidgetAttributes.chart) {
            console.log('A Chart Widget cannot live without a chart');
            return null;
        }
    }

    materialize(): Promise<IUIWidget> {
        const that = this;

        return new Promise<IUIWidget>((resolve, reject) => {
            that._resolveUIChart().then(resolvedUIChart => {
                if (!resolvedUIChart) {
                    reject('could not resolve ui chart');
                    return;
                }
                const materialized: IWidgetMaterializedFields = {
                    chart: JSON.stringify(resolvedUIChart)
                };

                const result = Object.assign({}, this.widget, { materialized: materialized });
                console.log(materialized.chart);
                resolve(<any>result);
                return;
            });
        });
    }

    private _resolveUIChart(): Promise<IChart> {
        const that = this;

        return new Promise<IChart>((resolve, reject) => {
            that.ctx.Chart
                .findOne({ _id: that.chartWidgetAttributes.chart })
                .populate({ path: 'kpis' })
                .then(chartDocument => {
                    if (!chartDocument) {
                        console.log('could not resolve a chart object for the kpi');
                        return resolve(null);
                    }
                    const chartObject = <IChart>chartDocument.toObject();
                    const uiChart = ChartFactory.getInstance(chartObject);
                    const kpi = KpiFactory.getInstance(chartObject.kpis[0], that.ctx);
                    const groupings = getGroupingMetadata(chartDocument, []);
                    const chartParameters: IChartMetadata = {
                        filter: chartObject.filter,
                        frequency: FrequencyTable[chartObject.frequency],
                        groupings: groupings,
                        comparison: chartObject.comparison,
                        xAxisSource: chartObject.xAxisSource
                    };

                    uiChart.getDefinition(kpi, chartParameters, [])
                            .then(definition => {
                            console.log('chart definition received for id: ' + chartDocument._id);
                            chartObject.chartDefinition = definition;
                            resolve(chartObject);
                            return;
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }
}

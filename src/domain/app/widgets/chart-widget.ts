import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { getGroupingMetadata } from '../../../app_modules/charts/queries';
import { IChartMetadata } from '../../../app_modules/charts/queries/charts';
import { ChartFactory } from '../../../app_modules/charts/queries/charts/chart-factory';
import { KpiFactory } from '../../../app_modules/kpis/queries';
import { FrequencyTable } from '../../common';
import { Charts, IChart } from '../charts';
import { Expenses } from '../expenses';
import { KPIs } from '../kpis/kpi.model';
import { Sales } from '../sales';
import { IWidget, IWidgetMaterializedFields } from './';
import { IUIWidget, UIWidgetBase } from './ui-widget-base';

@injectable()
export class ChartWidget extends UIWidgetBase implements IUIWidget {
    chart: string; // stringified representation of an IChart with its definition

    // TODO: Refactor
    constructor(
        @inject('Charts') private _charts: Charts,
        @inject('Sales') private _sales: Sales,
        @inject('Expenses') private _expenses: Expenses,
        @inject('KPIs') private _kpis: KPIs
        ) {
        super();
        if (!this.chartWidgetAttributes || !this.chartWidgetAttributes.chart) {
            console.log('A Chart Widget cannot live without a chart');
            return null;
        }
    }

    materialize(widget: IWidget): Promise<IUIWidget> {
        Object.assign(this, widget);
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

                const result = Object.assign({}, widget, { materialized: materialized });
                console.log(materialized.chart);
                resolve(<any>result);
                return;
            });
        });
    }

    private _resolveUIChart(): Promise<IChart> {
        const that = this;

        return new Promise<IChart>((resolve, reject) => {
            that._charts.model
                .findOne({ _id: that.chartWidgetAttributes.chart })
                .populate({ path: 'kpis' })
                .then(chartDocument => {
                    if (!chartDocument) {
                        console.log('could not resolve a chart object for the kpi');
                        return resolve(null);
                    }
                    const chartObject = <IChart>chartDocument.toObject();
                    const uiChart = ChartFactory.getInstance(chartObject);
                    // TODO: Refactor
                    const kpi = KpiFactory.getInstance(chartObject.kpis[0], that._kpis, that._sales, that._expenses);
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

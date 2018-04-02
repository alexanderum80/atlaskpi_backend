import { Expenses } from '../expenses/expense.model';

import { getGroupingMetadata } from '../../../app_modules/charts/queries/chart-grouping-map';
import { ChartFactory } from '../../../app_modules/charts/queries/charts/chart-factory';
import { IChartMetadata } from '../../../app_modules/charts/queries/charts/chart-metadata';
import { KpiFactory } from '../../../app_modules/kpis/queries/kpi.factory';
import { FrequencyTable } from '../../common/frequency-enum';
import { IChart } from '../charts/chart';
import { Charts } from '../charts/chart.model';
import { KPIs } from '../kpis/kpi.model';
import { Sales } from '../sales/sale.model';
import { IUIWidget, UIWidgetBase } from './ui-widget-base';
import { IWidget, IWidgetMaterializedFields } from './widget';
import { IVirtualSourceDocument } from '../virtual-sources/virtual-source';
import { VirtualSources } from '../virtual-sources/virtual-source.model';


export class ChartWidget extends UIWidgetBase implements IUIWidget {
    chart: string; // stringified representation of an IChart with its definition

    // TODO: Refactor
    constructor(
        protected widget: IWidget,
        private _kpiFactory: KpiFactory,
        private _chartFactory: ChartFactory,
        private _charts: Charts,
        private _sales: Sales,
        private _expenses: Expenses,
        private _kpis: KPIs,
        private _virtualSources: IVirtualSourceDocument[]
        ) {
        super(widget);
        if (!this.chartWidgetAttributes || !this.chartWidgetAttributes.chart) {
            console.log('A Chart Widget cannot live without a chart');
            return null;
        }
    }

    materialize(): Promise<IUIWidget> {
        Object.assign(this, this.widget);
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

    private async _resolveUIChart(): Promise<IChart> {
        try {
            const chartDocument = await this._charts.model
                .findOne({ _id: this.chartWidgetAttributes.chart })
                .populate({ path: 'kpis' });
            
            if (!chartDocument) {
                console.error('could not resolve a chart object for the kpi');
                return null;
            }

            const chartObject = <IChart>chartDocument.toObject();
            const uiChart = this._chartFactory.getInstance(chartObject);
            // TODO: Refactor
            const kpi = await this._kpiFactory.getInstance(chartObject.kpis[0]);
            const groupings = getGroupingMetadata(chartDocument, []);
            const chartParameters: IChartMetadata = {
                filter: chartObject.filter,
                frequency: FrequencyTable[chartObject.frequency],
                groupings: groupings,
                comparison: chartObject.comparison,
                xAxisSource: chartObject.xAxisSource
            };

            return await uiChart.getDefinition(kpi, chartParameters, []);
        } catch (e) {
            console.error('Error resolving ui chart', e);
            return null;
        }
    }
}

import { IAppModels } from '../app-models';
import { ChartFactory } from './../../../queries/app/charts/charts/chart-factory';
import { UIChartBase } from '../../../queries/app/charts/charts';
import { KpiFactory } from '../../../queries/app/kpis/kpi.factory';
import { KpiBase } from '../../../queries/app/kpis/kpi-base';
import { IWidget } from './';
import { IUIWidget, UIWidgetBase } from './ui-widget-base';

export class ChartWidget extends UIWidgetBase implements IUIWidget {
    chart: UIChartBase;

    constructor(widget: IWidget, ctx: IAppModels) {
        super(widget, ctx);
        if (!this.chartWidgetAttributes || !this.chartWidgetAttributes.chart) {
            console.log('A Chart Widget cannot live without a chart');
            return null;
        }
    }

    materialize(): Promise<IUIWidget> {
        // not implemented;
        return Promise.resolve(this);
    }
}
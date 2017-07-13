import { UIChartBase } from './chart-base';
import { IAppModels } from '../../../../models/app/app-models';
import { IChart, IChartDocument } from '../../../../models/app/charts';
import { LineChart } from './line.chart';

export function getUIChart(chart: IChart, ctx: IAppModels) {
    switch (chart.chartDefinition.type) {
        // Financial
        case 'line':
            return new LineChart(chart, ctx);

            default:
            return null;
    }
}
import { LineChart } from './line.chart';
import { UIChartBase } from './chart-base';
import { IAppModels } from '../../../../models/app/app-models';


export function getUIChart(chart: IChart, ctx: IAppModels) {
    switch (type) {
        // Financial
        case 'line':
            return new LineChart(ctx.Sale);

            default:
            return null;
    }
}
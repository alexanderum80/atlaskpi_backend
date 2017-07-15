import { IAppModels } from '../../../../models/app/app-models';
import { IChart } from '../../../../models/app/charts';
import { FrequencyHelper } from './frequency-values';
import {
    IUIChart,
    UIChartBase,
    ColumnChart,
    LineChart
} from '.';


export class ChartFactory {

    static getInstance(chart: IChart): IUIChart {
        switch (chart.chartDefinition.chart.type) {
            case 'column':
                return new ColumnChart(chart, new FrequencyHelper());
            // case 'line':
            //     return new LineChart(chart);
            default:
                return null;
        }
    }
}
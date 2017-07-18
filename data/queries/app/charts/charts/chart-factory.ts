import { ChartType } from './chart-type';
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
            case ChartType.Area:
                return new AreaChart(chart, new FrequencyHelper());
            case ChartType.Bar:
                return new BarChart(chart, new FrequencyHelper());
            case ChartType.Column:
                return new ColumnChart(chart, new FrequencyHelper());
            case ChartType.Donut:
                return new DonutChart(chart, new FrequencyHelper());
            case ChartType.Line:
                return new LineChart(chart, new FrequencyHelper());
            case ChartType.Pie:
                return new PieChart(chart, new FrequencyHelper());
            default:
                return null;
        }
    }
}
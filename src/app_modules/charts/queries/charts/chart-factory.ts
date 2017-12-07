import { IChart } from '../../../../domain/app/charts';

import { FrequencyHelper } from './frequency-values';
import {
    AreaChart,
    BarChart,
    ChartType,
    ColumnChart,
    DonutChart,
    IUIChart,
    LineChart,
    PieChart,
    SPLineChart,
    UIChartBase,
} from '.';
import { injectable } from 'inversify';

@injectable()
export class ChartFactory {

    getInstance(chart: IChart): IUIChart {
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
            case ChartType.Spline:
                return new SPLineChart(chart, new FrequencyHelper());
            case ChartType.Pie:
                return new PieChart(chart, new FrequencyHelper());
            default:
                return null;
        }
    }
}
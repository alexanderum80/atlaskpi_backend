import { injectable } from 'inversify';

import { IChart } from '../../../../domain/app/charts/chart';
import { AreaChart } from './area.chart';
import { BarChart } from './bar.chart';
import { ChartType } from './chart-type';
import { ColumnChart } from './column.chart';
import { DonutChart } from './donut.chart';
import { FrequencyHelper } from './frequency-values';
import { LineChart } from './line.chart';
import { PieChart } from './pie.chart';
import { SPLineChart } from './spline.chart';
import { IUIChart } from './ui-chart-base';

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
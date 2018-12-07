import { injectable, inject } from 'inversify';

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
import { IVirtualSourceDocument } from '../../../../domain/app/virtual-sources/virtual-source';
import { CurrentUser } from '../../../../domain/app/current-user';

@injectable()
export class ChartFactory {

    @inject(CurrentUser.name) private _user: CurrentUser;

    getInstance(chart: IChart): IUIChart {
        const tz = this._user.get().profile.timezone;

        switch (chart.chartDefinition.chart.type) {
            case ChartType.Area:
                return new AreaChart(chart, new FrequencyHelper(), tz);
            case ChartType.Bar:
                return new BarChart(chart, new FrequencyHelper(),  tz);
            case ChartType.Column:
                return new ColumnChart(chart, new FrequencyHelper(), tz);
            case ChartType.Donut:
                return new DonutChart(chart, new FrequencyHelper(), tz);
            case ChartType.Line:
                return new LineChart(chart, new FrequencyHelper(), tz);
            case ChartType.Spline:
                return new SPLineChart(chart, new FrequencyHelper(), tz);
            case ChartType.Pie:
                return new PieChart(chart, new FrequencyHelper(), tz);
            default:
                return null;
        }
    }
}
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
        const fh = new FrequencyHelper();

        switch (chart.chartDefinition.chart.type) {
            case ChartType.Area:
                return new AreaChart(chart, fh, tz);
            case ChartType.Bar:
                return new BarChart(chart, fh,  tz);
            case ChartType.Column:
                return new ColumnChart(chart, fh, tz);
            case ChartType.Donut:
                return new DonutChart(chart, fh, tz);
            case ChartType.Line:
                return new LineChart(chart, fh, tz);
            case ChartType.Spline:
                return new SPLineChart(chart, fh, tz);
            case ChartType.Pie:
                return new PieChart(chart, fh, tz);
            default:
                return null;
        }
    }
}
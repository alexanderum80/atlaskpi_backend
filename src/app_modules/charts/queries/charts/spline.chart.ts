import * as Promise from 'bluebird';

import { IUIChart, UIChartBase } from './';
import { IKpiBase } from './../../../../app_modules/kpis/queries/kpi-base';
import { IChart } from './../../../../domain/app/charts/chart';
import { ITargetDocument } from './../../../../domain/app/targets/target';
import { IChartMetadata } from './chart-metadata';
import { FrequencyHelper } from './frequency-values';

// const basicDefinition = { 'chart'    : { 'type': 'spline', 'inverted' : false },
//   'plotOptions': { 'series': { 'lineWidth': 4 }, 'line': { 'dataLabels': { 'enabled': false } } },
//   'yAxis'    : { 'plotLines' : [ { 'value' : 0,
//                                    'width' : 1,
//                                    'color' : '#808080' } ] },
//   'legend'   : { 'layout'        : 'vertical',
//                  'align'         : 'right',
//                  'verticalAlign' : 'middle',
//                  'borderWidth'   : 0 }
// };

export class SPLineChart extends UIChartBase implements IUIChart {

    protected basicDefinition = {
        chart: { type: 'spline' },
        plotOptions: { series: { lineWidth: 5 } }
    };

    constructor(chart: IChart, frequencyHelper: FrequencyHelper) {
        super(chart, frequencyHelper);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata, target?: ITargetDocument[]): Promise < any > {
        const that = this;

        this.dateRange = this._getDateRange(metadata.dateRange);
        this.comparison = this._getComparisonDateRanges(this.dateRange, metadata.comparison);
        console.dir(this.comparison);
        return (this.comparison && this.comparison.length > 0)
            ? this.getDefinitionOfComparisonChart(kpi, metadata)
            : this.getDefinitionForDateRange(kpi, metadata, target);
    }

}
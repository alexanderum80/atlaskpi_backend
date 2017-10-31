import { ITarget, ITargetDocument } from '../../../../models/app/targets/ITarget';
import * as Promise from 'bluebird';
import {
    IDateRange
} from '../../../../models/common';
import {
    IKpiBase
} from '../../kpis/kpi-base';
import {
    IChartMetadata
} from './chart-metadata';
import {
    FrequencyHelper
} from './frequency-values';
import {
    IChart
} from '../../../../models/app/charts';
import {
    IUIChart,
    UIChartBase
} from './';

// const basicDefinition = { 'chart'    : { 'type': 'line', 'inverted' : false },
//   'plotOptions': { 'series': { 'lineWidth': 4 }, 'line': { 'dataLabels': { 'enabled': false } } },
//   'yAxis'    : { 'plotLines' : [ { 'value' : 0,
//                                    'width' : 1,
//                                    'color' : '#808080' } ] },
//   'legend'   : { 'layout'        : 'vertical',
//                  'align'         : 'right',
//                  'verticalAlign' : 'middle',
//                  'borderWidth'   : 0 }
// };

export class LineChart extends UIChartBase implements IUIChart {

    protected basicDefinition = {
        chart: { type: 'line' },
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
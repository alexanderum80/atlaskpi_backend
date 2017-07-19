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

const basicDefinition = { 'chart'    : { 'type': 'line', 'inverted' : false },
  'plotOptions': { 'line': { 'dataLabels': { 'enabled': false } } },
  'yAxis'    : { 'plotLines' : [ { 'value' : 0,
                                   'width' : 1,
                                   'color' : '#808080' } ] },
  'legend'   : { 'layout'        : 'vertical',
                 'align'         : 'right',
                 'verticalAlign' : 'middle',
                 'borderWidth'   : 0 }
};

export class LineChart extends UIChartBase implements IUIChart {

    constructor(chart: IChart, frequencyHelper: FrequencyHelper) {
        super(chart, frequencyHelper);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata): Promise < any > {
        const that = this;

        return this.processChartData(kpi, metadata).then(() => {
            return that.buildDefinition(basicDefinition);
        });
    }

}
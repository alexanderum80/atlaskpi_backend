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

export class BarChart extends UIChartBase implements IUIChart {
    private basicDefinition = { 'chart'       : { 'type': 'bar' } };

    constructor(chart: IChart, frequencyHelper: FrequencyHelper) {
        super(chart, frequencyHelper);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata): Promise < any > {
        const that = this;

        return this.processChartData(kpi, metadata).then(() => {
            return that.buildDefinition(this.basicDefinition);
        });
    }

}
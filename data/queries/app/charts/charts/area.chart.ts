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

export class AreaChart extends UIChartBase implements IUIChart {

    private basicDefinition = { 'chart'       : { 'type': 'area', 'inverted': false }};

    constructor(chart: IChart, frequencyHelper: FrequencyHelper) {
        super(chart, frequencyHelper);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata, target?: ITargetDocument[]): Promise < string > {
        const that = this;

        return this.processChartData(kpi, metadata, target).then(() => {
            return that.buildDefinition(this.basicDefinition, target);
        });
    }

}
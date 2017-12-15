import * as Promise from 'bluebird';

import { IUIChart, UIChartBase } from './';
import { IKpiBase } from './../../../../app_modules/kpis/queries/kpi-base';
import { IChart } from './../../../../domain/app/charts/chart';
import { ITargetDocument } from './../../../../domain/app/targets/target';
import { IChartMetadata } from './chart-metadata';
import { FrequencyHelper } from './frequency-values';

export class DonutChart extends UIChartBase implements IUIChart {

    constructor(chart: IChart, frequencyHelper: FrequencyHelper) {
        super(chart, frequencyHelper);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata, target?: ITargetDocument[]): Promise < string > {
        return this.processChartData(kpi, metadata, target).then(res => JSON.stringify(res));
    }

}
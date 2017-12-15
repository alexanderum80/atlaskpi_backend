import * as Promise from 'bluebird';

import { IUIChart, UIChartBase } from './';
import { IKpiBase } from './../../../../app_modules/kpis/queries/kpi-base';
import { IChart } from './../../../../domain/app/charts/chart';
import { ITargetDocument } from './../../../../domain/app/targets/target';
import { IChartMetadata } from './chart-metadata';
import { FrequencyHelper } from './frequency-values';

// const basicDefinition = {
//     'plotOptions': {
//         'pie': {
//             'dataLabels': {
//                 'enabled': true
//             }
//         }
//     }
// };

export class PieChart extends UIChartBase implements IUIChart {

    protected basicDefinition = {
        chart: { type: 'pie' }
    };

    constructor(chart: IChart, frequencyHelper: FrequencyHelper) {
        super(chart, frequencyHelper);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata, target?: ITargetDocument[]): Promise < any > {
        const that = this;

        return this.processChartData(kpi, metadata, target).then(() => {
            return that.buildDefinition(this.basicDefinition, target);
        });
    }

}

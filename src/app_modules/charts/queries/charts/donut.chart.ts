import { IChart } from '../../../../domain/app/charts/chart';
import { IKpiBase } from '../../../kpis/queries/kpi-base';
import { IChartMetadata } from './chart-metadata';
import { FrequencyHelper } from './frequency-values';
import { IUIChart, UIChartBase } from './ui-chart-base';
import { ITargetNewDocument } from '../../../../domain/app/targetsNew/target';


export class DonutChart extends UIChartBase implements IUIChart {

    constructor(chart: IChart, frequencyHelper: FrequencyHelper) {
        super(chart, frequencyHelper);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata, target?: ITargetNewDocument[]): Promise < string > {
        return this.processChartData(kpi, metadata, target).then(res => JSON.stringify(res));
    }

}
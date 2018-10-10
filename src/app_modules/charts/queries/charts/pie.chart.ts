import { IChart } from '../../../../domain/app/charts/chart';
import { IKpiBase } from '../../../kpis/queries/kpi-base';
import { IChartMetadata } from './chart-metadata';
import { FrequencyHelper } from './frequency-values';
import { IUIChart, UIChartBase } from './ui-chart-base';
import { ITargetNewDocument } from '../../../../domain/app/targetsNew/target';


export class PieChart extends UIChartBase implements IUIChart {

    protected basicDefinition = {
        chart: { type: 'pie' }
    };

    constructor(chart: IChart, frequencyHelper: FrequencyHelper) {
        super(chart, frequencyHelper);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata, target?: ITargetNewDocument[]): Promise < any > {
        const that = this;

        return this.processChartData(kpi, metadata, target).then(() => {
            return that.buildDefinition(this.basicDefinition, metadata, target);
        });
    }

}

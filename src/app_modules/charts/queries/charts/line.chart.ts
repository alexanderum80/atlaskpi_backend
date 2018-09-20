import { IChart } from '../../../../domain/app/charts/chart';
import { IKpiBase } from '../../../kpis/queries/kpi-base';
import { IChartMetadata } from './chart-metadata';
import { FrequencyHelper } from './frequency-values';
import { IUIChart, UIChartBase } from './ui-chart-base';
import { ITargetNewDocument } from '../../../../domain/app/targetsNew/target';

export class LineChart extends UIChartBase implements IUIChart {

    protected basicDefinition = {
        chart: { type: 'line' },
        plotOptions: { series: { lineWidth: 5 } }
    };

    constructor(chart: IChart, frequencyHelper: FrequencyHelper) {
        super(chart, frequencyHelper);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata, target?: ITargetNewDocument[]): Promise < any > {
        const that = this;

        this.dateRange = this._getDateRange(metadata.dateRange);
        this.comparison = this._getComparisonDateRanges(this.dateRange, metadata.comparison);

        return (this.comparison && this.comparison.length > 0)
            ? this.getDefinitionOfComparisonChart(kpi, metadata, target)
            : this.getDefinitionForDateRange(kpi, metadata, target);
    }

}
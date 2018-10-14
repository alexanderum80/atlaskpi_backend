import { IUIChart, UIChartBase } from './ui-chart-base';
import { IChart } from './../../../../domain/app/charts/chart';
import { IKpiBase } from './../../../../app_modules/kpis/queries/kpi-base';
import { IChartMetadata } from './chart-metadata';
import { FrequencyHelper } from './frequency-values';
import { ITargetNewDocument } from '../../../../domain/app/targetsNew/target';

export class AreaChart extends UIChartBase implements IUIChart {

    protected basicDefinition = { 'chart'       : { 'type': 'area', 'inverted': false }};

    constructor(chart: IChart, frequencyHelper: FrequencyHelper, tz: string) {
        super(chart, frequencyHelper, tz);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata, target?: ITargetNewDocument[]): Promise < string > {
        const that = this;

        this.dateRange = metadata.dateRange;
        this.comparison = this._getComparisonDateRanges(this.dateRange as any, metadata.comparison);

        return (this.comparison && this.comparison.length > 0)
            ? this.getDefinitionOfComparisonChart(kpi, metadata, target)
            : this.getDefinitionForDateRange(kpi, metadata, target);
    }

}
import * as Promise from 'bluebird';
import * as console from 'console';

import { IChart } from '../../../../domain/app/charts/chart';
import { ITargetDocument } from '../../../../domain/app/targets/target';
import { IKpiBase } from '../../../kpis/queries/kpi-base';
import { IChartMetadata } from './chart-metadata';
import { FrequencyHelper } from './frequency-values';
import { IUIChart, UIChartBase } from './ui-chart-base';


export class SPLineChart extends UIChartBase implements IUIChart {

    protected basicDefinition = {
        chart: { type: 'spline' },
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
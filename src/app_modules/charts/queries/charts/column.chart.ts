import * as console from 'console';
import { min } from 'moment';

import { IChart } from '../../../../domain/app/charts/chart';
import { IKpiBase } from '../../../kpis/queries/kpi-base';
import { IChartMetadata } from './chart-metadata';
import { FrequencyHelper } from './frequency-values';
import { IUIChart, UIChartBase } from './ui-chart-base';
import { ITargetNewDocument } from '../../../../domain/app/targetsNew/target';

export class ColumnChart extends UIChartBase implements IUIChart {

    protected basicDefinition = {
        chart: { type: 'column' },
        yAxis: {
            title: { text: '' }
        }
    };

    constructor(chart: IChart, frequencyHelper: FrequencyHelper, tz: string) {
        super(chart, frequencyHelper, tz);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata, target?: ITargetNewDocument[]): Promise < any > {
        const that = this;

        this.dateRange = metadata.dateRange;
        this.comparison = this._getComparisonDateRanges(this.dateRange, metadata.comparison);

        return (this.comparison && this.comparison.length > 0)
            ? this.getDefinitionOfComparisonChart(kpi, metadata, target)
            : this.getDefinitionForDateRange(kpi, metadata, target);
    }
}
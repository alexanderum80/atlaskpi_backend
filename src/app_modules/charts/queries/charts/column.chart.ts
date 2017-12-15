import * as Promise from 'bluebird';

import { IKpiBase } from './../../../../app_modules/kpis/queries/kpi-base';
import { IChart } from './../../../../domain/app/charts/chart';
import { ITargetDocument } from './../../../../domain/app/targets/target';
import { IChartMetadata } from './chart-metadata';
import { FrequencyHelper } from './frequency-values';
import { IUIChart, UIChartBase } from './ui-chart-base';

export class ColumnChart extends UIChartBase implements IUIChart {

    protected basicDefinition = {
        chart: { type: 'column' },
        yAxis: {
            min: 0,
            title: { text: '' }
        }
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

    // getDefinition(kpi: IKpiBase, dateRange: IDateRange, metadata?: IChartMetadata): Promise<string> {
    //     let that = this;

    //     return new Promise<string>((resolve, reject) => {
    //         that.getKPIData(kpi, dateRange, metadata).then(elements => {
    //             let output = that.chart;
    //             let xAxis = output.chartDefinition.xAxis || {};
    //             xAxis.categories = elements.categories;
    //             output.chartDefinition.series = elements.series;
    //             resolve(JSON.stringify(output));
    //         });
    //     });
    // }
}
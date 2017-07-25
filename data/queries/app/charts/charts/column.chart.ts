import { IChartOptions } from './chart-type';
import { UIChartBase, IUIChart } from './ui-chart-base';
import * as Handlebars from 'handlebars';
import { IAppModels } from '../../../../models/app';
import { IChart, IChartDocument } from '../../../../models/app/charts';
import { FrequencyEnum, IDateRange } from '../../../../models/common';
import { ChartPreProcessorExtention } from './chart-preprocessor-extention';
import { IFrequencyValues, FrequencyHelper } from './frequency-values';
import { IChartMetadata } from './chart-metadata';
import { IKpiBase } from '../../kpis/kpi-base';
import * as Promise from 'bluebird';

export class ColumnChart extends UIChartBase implements IUIChart {

    private basicDefinition = {
        chart: { type: 'column' },
        yAxis: {
            min: 0,
            title: { text: '' }
        }
    };

    constructor(chart: IChart, frequencyHelper: FrequencyHelper) {
        super(chart, frequencyHelper);
    }

    getDefinition(kpi: IKpiBase, metadata?: IChartMetadata): Promise < any > {
        const that = this;

        return this.processChartData(kpi, metadata).then(() => {
            return that.buildDefinition(this.basicDefinition);
        });
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
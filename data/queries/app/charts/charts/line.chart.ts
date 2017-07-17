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

export class LineChart extends UIChartBase implements IUIChart {

    constructor(_chart: IChart, frequencyHelper: FrequencyHelper) {
        super(_chart, frequencyHelper);
    }

    getUIDefinition(kpi: IKpiBase, dateRange: IDateRange, metadata?: IChartMetadata): Promise<string> {
        let that = this;

        return new Promise<string>((resolve, reject) => {
            that.getKPIData(kpi, dateRange, metadata).then(elements => {
                let output = that.chart;
                let xAxis = output.chartDefinition.xAxis || {};
                xAxis.categories = elements.categories;
                output.chartDefinition.series = elements.series;
                resolve(JSON.stringify(output));
            });
        });
    }

    prepareXAxis() {
        return 'Not Implemented Yet';
    }

    prepareYAxis() {
         return 'Not Implemented Yet';
    }

    prepareCategories() {
        return 'Not Implemented Yet';
    }

    prepareSeries() {
    }

    getDefinition(dateRange: IDateRange, frequency: FrequencyEnum): Promise<any> {
         return null;
    }

}
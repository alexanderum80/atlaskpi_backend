import { IChartOptions } from './chart-type';
import { UIChartBase, IUIChart } from './ui-chart-base';
import * as Handlebars from 'handlebars';
import { IAppModels } from '../../../../models/app';
import { IChart, IChartDocument } from '../../../../models/app/charts';
import { FrequencyEnum, IDateRange } from '../../../../models/common';
import { ChartPreProcessorExtention } from './chart-preprocessor-extention';
import { IKpiBase } from '../../kpis/kpi-base';
import * as Promise from 'bluebird';

export class ColumnChart extends UIChartBase implements IUIChart {

    constructor(_chart: IChart) {
        super(_chart);
    }

    getUIDefinition(kpiBase: IKpiBase, dateRange: IDateRange, frequency: FrequencyEnum, grouping: string): Promise<string> {
        let that = this;

        return new Promise<string>((resolve, reject) => {
            kpiBase.getData(dateRange, frequency, grouping).then(rawData => {
                let series = this.getSeriesByFrequency(frequency, rawData);
                resolve('');
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
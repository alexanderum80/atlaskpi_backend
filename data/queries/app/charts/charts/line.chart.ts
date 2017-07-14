import { IChartOptions } from './chart-type';
import { UIChartBase, IUIChart } from './chart-base';
import * as Handlebars from 'handlebars';
import { IAppModels } from '../../../../models/app/app-models';
import { IChart, IChartDocument } from '../../../../models/app/charts';
import { FrequencyEnum, IDateRange } from '../../../../models/common';
import { ChartPreProcessorExtention } from './chart-preprocessor-extention';
import * as Promise from 'bluebird';

export class LineChart extends UIChartBase implements IUIChart {

    constructor(_chart: IChart, ctx: IAppModels) {
        super(_chart, ctx);
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
         this.getKPIData()
    }

}
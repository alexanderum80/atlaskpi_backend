import { FrequencyEnum, IDateRange } from '../../../../models/common';
import { IAppModels } from '../../../../models/app/app-models';
import { getKPI } from '../../kpis/kpi.factory';
import { IKpiBase, IKPIResult } from '../../kpis/kpi-base';
import { IChart, IChartDocument } from '../../../../models/app/charts';
import { ChartPreProcessorExtention } from './chart-preprocessor-extention';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { ChartPostProcessingExtention } from './chart-postprocessing-extention';

export interface IUIChart {
    prepareCategories();
    prepareSeries();
    getDefinition(dateRange: IDateRange, frequency: FrequencyEnum): Promise<any>;
};

export class UIChartBase {
    private _kpi: IKpiBase;

    series: any;
    categories: any;

    chartPreProcessor: ChartPreProcessorExtention;

    constructor(private _chart: IChart, ctx: IAppModels) {

        if (!_chart.kpis || _chart.kpis.length < 1) {
            throw 'A chart cannot be created with a KPI';
        }

        this._kpi = getKPI(_chart.kpis[0].code, ctx);
    }

    getKPIData(dateRange: IDateRange, frequency: FrequencyEnum): Promise<IKPIResult> {
        let that = this;

        return new Promise<IKPIResult>((resolve, reject) => {
            let chartDr;
            if (this._chart.dateFrom && this._chart.dateTo) {
                chartDr = { from: new Date(this._chart.dateFrom), to: new Date(this._chart.dateTo) };
            }

            dateRange = dateRange || chartDr;
            console.log(frequency);

            return that._kpi.getData(dateRange, frequency);
        });
    }

}
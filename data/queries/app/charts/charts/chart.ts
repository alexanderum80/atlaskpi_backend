import { ChartProcessor } from '../chart-processor';
import { FrequencyEnum, IDateRange } from '../../../../models/common';
import { IAppModels } from '../../../../models/app/app-models';
import { getKPI } from '../../kpis/kpi.factory';
import { IChart, IChartDocument } from '../../../../models/app/charts';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { ChartPostProcessingExtention } from './chart-postprocessing-extention';

export class Chart {
    private _kpi: any;

    constructor(private _chart: IChart, ctx: IAppModels) {

        if (!_chart.kpis || _chart.kpis.length < 1) {
            throw 'A chart cannot be created with a KPI';
        }

        this._kpi = getKPI(_chart.kpis[0].code, ctx);
    }

    getDefinition(dateRange: IDateRange, frequency: FrequencyEnum): Promise<string> {
        let that = this;
        let chartProcessor = new ChartPostProcessingExtention();

        return new Promise<string>((resolve, reject) => {
            let chartDr;
            if (this._chart.dateFrom && this._chart.dateTo) {
                chartDr = { from: new Date(this._chart.dateFrom), to: new Date(this._chart.dateTo) };
            }

            that._kpi.getData(chartDr || dateRange, frequency).then(series => {
                that._chart.chartDefinition = chartProcessor.process(that._chart, series);
                resolve(JSON.stringify(that._chart));
            }, (e) => reject(e));
        });
    }

}


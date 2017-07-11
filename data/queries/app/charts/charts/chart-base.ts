import { FrequencyEnum, IDateRange } from '../../../../models/common';
import { IAppModels } from '../../../../models/app/app-models';
import { getKPI, KpiBase } from '../../kpis/kpi.factory';
import { IChart, IChartDocument } from '../../../../models/app/charts';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { ChartPostProcessingExtention } from './chart-postprocessing-extention';

export interface IUIChart {
    void preparexAxis();
    void prepareYAxis();
    void prepareSeries();
    void getDefinition();
}

export class UIChartBase {
    private _kpi: KpiBase;

    constructor(private _chart: IChart, ctx: IAppModels) {

        if (!_chart.kpis || _chart.kpis.length < 1) {
            throw 'A chart cannot be created with a KPI';
        }

        this._kpi = gextKPI(_chart.kpis[0].code, ctx);
    }

    getKPIData(dateRange: IDateRange, frequency: FrequencyEnum): Promise<string> {
        let that = this;

        return new Promise<any>((resolve, reject) => {
            let chartDr;
            if (this._chart.dateFrom && this._chart.dateTo) {
                chartDr = { from: new Date(this._chart.dateFrom), to: new Date(this._chart.dateTo) };
            }

            dateRange = dateRange || chartDr;
            console.log(frequency);

            that._kpi.getData(dateRange, frequency);
        });
    }

}
import { FrequencyTable } from '../../../models/common/frequency-enum';
import { FrequencyEnum, IDateRange } from '../../../models/common';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IChart } from '../../../models/app/charts';
import { IAppModels } from '../../../models/app/app-models';
import { Chart } from '../charts/charts/chart';

import { ChartFactory } from './charts/chart-factory';
import { KpiFactory } from '../kpis/kpi.factory';
import { getGroupingMetadata } from './chart-grouping-map';

export class GetChartQuery implements IQuery<string> {

    constructor(public identity: IIdentity, private _ctx: IAppModels) { }

    // log = true;
    // audit = true;

    run(data: { id: string, dateRange: { from: string, to: string}, frequency: string, grouping: string }): Promise<string> {
        let that = this;

        let dr: IDateRange = {
            from: new Date(data.dateRange.from),
            to: new Date(data.dateRange.to)
        };
        let frequency = FrequencyTable[data.frequency];

        return new Promise<string>((resolve, reject) => {
            that._ctx.Chart
                .findOne({ _id: data.id })
                .populate({
                    path: 'kpis',
                })
                .then(chartDocument => {

                    if (!chartDocument) {
                        reject(null);
                        return;
                    }

                    let chart = ChartFactory.getInstance(chartDocument);
                    let kpi = KpiFactory.getInstance(chartDocument.kpis[0], that._ctx);
                    let grouping = getGroupingMetadata(data.grouping);

                    chart.getUIDefinition(kpi, dr, frequency, grouping).then((definition) => {
                        resolve(definition);
                    }).catch(e => reject(e));
                });
        });
    }
}

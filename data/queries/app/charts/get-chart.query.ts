import { SampleDefinitionsTable } from './charts/sample-definitions.chart';
import { IChartMetadata } from './charts/chart-metadata';
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

    constructor(public identity: IIdentity, private _ctx: IAppModels, private _preview?: boolean) { }

    // log = true;
    // audit = true;

    run(data: { id: string, dateRange?: { from: string, to: string}, frequency?: string, groupings?: string[], xAxisSource?: string }): Promise<string> {
        let that = this;

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

                    if (that._preview) {
                        let type = chartDocument.chartDefinition.chart.type;
                        chartDocument.chartDefinition = JSON.parse(SampleDefinitionsTable[type]) || [];
                        return resolve(JSON.stringify(chartDocument));
                    }

                    let chart = ChartFactory.getInstance(chartDocument);
                    let kpi = KpiFactory.getInstance(chartDocument.kpis[0], that._ctx);
                    let groupings = getGroupingMetadata(chartDocument, data.groupings);

                    let frequency = FrequencyTable[data.frequency ? data.frequency : chartDocument.frequency];
                    let definitionParameters: IChartMetadata = {
                        frequency: frequency,
                        groupings: groupings,
                        xAxisSource: data.xAxisSource
                    };

                    if (data.dateRange) {
                        definitionParameters.dateRange = {
                            predefined: null,
                            custom: {
                                from: new Date(data.dateRange.from),
                                to: new Date(data.dateRange.to)
                            }
                        };
                    }

                    chart.getDefinition(kpi, definitionParameters).then((definition) => {
                        chartDocument.chartDefinition = definition;
                        resolve(JSON.stringify(chartDocument));
                    }).catch(e => reject(e));
                });
        });
    }
}

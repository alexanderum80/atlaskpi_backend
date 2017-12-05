import { attachToDashboards } from '../../dashboards/mutations/common';
import { IChartInput } from '../../../domain/app/charts';
import { Winston } from 'winston';
import { Dashboards } from '../../../domain/app/dashboards';
import { KPIs } from '../../../domain/app/kpis';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Charts } from '../../../domain';
import { ChartMutationResponse, ChartAttributesInput } from '../charts.types';
import { CreateChartActivity } from '../activities';

@injectable()
@mutation({
    name: 'createChart',
    activity: CreateChartActivity,
    parameters: [
        { name: 'input', type: ChartAttributesInput },
    ],
    output: { type: ChartMutationResponse }
})
export class CreateChartMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject('KPIs') private _kpis: KPIs,
        @inject('Charts') private _charts: Charts,
        @inject('Dashboards') private _dashboards: Dashboards,
        @inject('logger') private _logger: Winston
    ) {
        super();
    }

    run(data: { input: IChartInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            // resolve kpis
            that._kpis.model.find({ _id: { $in: data.input.kpis }})
            .then((kpis) => {
                if (!kpis || kpis.length !== data.input.kpis.length) {
                    that._logger.error('one or more kpi not found');
                    return resolve({ success: false, errors: [ { field: 'kpis', errors: ['one or more kpis not found'] } ]});
                }

                // resolve dashboards to include the chart
                that._dashboards.model.find( {_id: { $in: data.input.dashboards }})
                .then((dashboards) => {
                    const inputDashboards = data.input.dashboards || [];
                    if (!dashboards || dashboards.length !== inputDashboards.length) {
                        that._logger.error('one or more dashboard not found');
                        resolve({ success: false, errors: [ { field: 'dashboards', errors: ['one or more dashboards not found'] } ]});
                        return;
                    }

                    // create the chart
                    that._charts.model.createChart(data.input)
                    .then((chart) => {
                        attachToDashboards(that._dashboards.model, data.input.dashboards, chart._id)
                        .then(() => {
                            resolve({ entity: chart, success: true });
                            return;
                        });
                    });
                });
            })
            .catch(err => resolve({ success: false, errors: [ { field: 'chart', errors: [err] } ]}));
        });
    }
}


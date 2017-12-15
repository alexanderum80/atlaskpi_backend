import { attachToDashboards, detachFromDashboards } from './common';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { difference } from 'lodash';
import { Winston } from 'winston';

import { IChartInput } from '../../../domain/app/charts/chart';
import { Charts } from '../../../domain/app/charts/chart.model';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { field } from '../../../framework/decorators/field.decorator';
import { input } from '../../../framework/decorators/input.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateChartActivity } from '../activities/update-chart.activity';
import { ChartAttributesInput, ChartMutationResponse } from '../charts.types';


@injectable()
@mutation({
    name: 'updateChart',
    activity: UpdateChartActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: ChartAttributesInput, required: true },
    ],
    output: { type: ChartMutationResponse }
})
export class UpdateChartMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject('KPIs') private _kpis: KPIs,
        @inject('Charts') private _charts: Charts,
        @inject('Dashboards') private _dashboards: Dashboards,
        @inject('logger') private _logger: Winston
    ) {
        super();
    }

    run(data: { id: string, input: IChartInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            // resolve kpis
            that._kpis.model.find({ _id: { $in: data.input.kpis }})
            .then((kpis) => {
                if (!kpis || kpis.length !== data.input.kpis.length) {
                    that._logger.error('one or more kpi not found:' + data.id);
                    resolve({ success: false, errors: [ { field: 'kpis', errors: ['one or more kpis not found'] } ]});
                    return;
                }

                // resolve dashboards the chart is in
                that._dashboards.model.find( {charts: { $in: [data.id]}})
                .then((chartDashboards) => {
                    // update the chart
                    that._charts.model.updateChart(data.id, data.input)
                    .then((chart) => {
                        const currentDashboardIds = chartDashboards.map(d => String(d._id));
                        const toRemoveDashboardIds = difference(currentDashboardIds, data.input.dashboards);
                        const toAddDashboardIds = difference(data.input.dashboards, currentDashboardIds);

                        detachFromDashboards(that._dashboards.model, toRemoveDashboardIds, chart._id)
                        .then(() => {
                            attachToDashboards(that._dashboards.model, toAddDashboardIds, chart._id)
                            .then(() => {
                                resolve({ entity: chart, success: true });
                                return;
                            });
                        });

                    });
                });
            })
            .catch(err => resolve({ success: false, errors: [ { field: 'chart', errors: [err] } ]}));
        });
    }
}

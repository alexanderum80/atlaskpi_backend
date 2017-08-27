import { attachToDashboards, detachFromDashboards } from './common';
import { IChartModel, IChartInput } from '../../../models/app/charts';
import { IKPIModel } from '../../../models/app/kpis';
import { IDashboardDocument, IDashboardModel } from '../../../models/app/dashboards';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import { AccountCreatedNotification } from '../../../../services';
import * as logger from 'winston';
import * as _ from 'lodash';

interface IUpdateChartMutation {
    id: string;
    input: IChartInput;
}

export class UpdateChartMutation implements IMutation<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _chartModel: IChartModel,
        private _kpiModel: IKPIModel,
        private _dashboardModel: IDashboardModel) { }

    audit = true;

    run(data: IUpdateChartMutation): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            // resolve kpis
            that._kpiModel.find({ _id: { $in: data.input.kpis }})
            .then((kpis) => {
                if (!kpis || kpis.length !== data.input.kpis.length) {
                    logger.error('one or more kpi not found:' + data.id);
                    resolve({ success: false, errors: [ { field: 'kpis', errors: ['one or more kpis not found'] } ]});
                    return;
                }

                // resolve dashboards the chart is in
                that._dashboardModel.find( {charts: { $in: [data.id]}})
                .then((chartDashboards) => {
                    // update the chart
                    that._chartModel.updateChart(data.id, data.input)
                    .then((chart) => {
                        const currentDashboardIds = chartDashboards.map(d => String(d._id));
                        const toRemoveDashboardIds = _.difference(currentDashboardIds, data.input.dashboards);
                        const toAddDashboardIds = _.difference(data.input.dashboards, currentDashboardIds);

                        detachFromDashboards(that._dashboardModel, toRemoveDashboardIds, chart._id)
                        .then(() => {
                            attachToDashboards(that._dashboardModel, toAddDashboardIds, chart._id)
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

import { MutationBase } from '../../mutation-base';
import { attachToDashboards, detachFromDashboards } from './common';
import { IChartModel, IChartInput } from '../../../models/app/charts';
import { IKPIModel } from '../../../models/app/kpis';
import { IDashboardDocument, IDashboardModel } from '../../../models/app/dashboards';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import { AccountCreatedNotification } from '../../../../services';
import * as logger from 'winston';

interface IUpdateChartMutation {
    id: string;
    input: IChartInput;
}

export class UpdateChartMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _chartModel: IChartModel,
        private _kpiModel: IKPIModel,
        private _dashboardModel: IDashboardModel) {
            super(identity);
        }

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

                // resolve dashboards
                that._dashboardModel.find( {_id: { $in: data.input.dashboards }})
                .then((dashboards) => {
                    if (!dashboards || dashboards.length !== data.input.dashboards.length) {
                        logger.error('one or more dashboard not found:' + data.id);
                        resolve({ success: false, errors: [ { field: 'dashboards', errors: ['one or more dashboards not found'] } ]});
                        return;
                    }

                    // update the chart
                    that._chartModel.updateChart(data.id, data.input)
                    .then((chart) => {
                        detachFromDashboards(that._dashboardModel, chart)
                        .then(() => {
                            attachToDashboards(that._dashboardModel, dashboards, chart)
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

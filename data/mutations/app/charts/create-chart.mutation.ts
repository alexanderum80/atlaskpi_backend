import { attachToDashboards } from './common';
import { IChartModel } from '../../../models/app/charts';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import { IKPIModel } from '../../../models/app/kpis';
import { IDashboardDocument, IDashboardModel } from '../../../models/app/dashboards';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class CreateChartMutation implements IMutation<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _chartModel: IChartModel,
        private _kpiModel: IKPIModel,
        private _dashboardModel: IDashboardModel) { }

    audit = true;

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            // resolve kpis
            that._kpiModel.find({ _id: { $in: data.input.kpis }})
            .then((kpis) => {
                if (!kpis || kpis.length !== data.input.kpis.length) {
                    logger.error('one or more kpi not found:' + data.id);
                    return resolve({ success: false, errors: [ { field: 'kpis', errors: ['one or more kpis not found'] } ]});
                }

                // resolve dashboards to include the chart
                that._dashboardModel.find( {_id: { $in: data.input.dashboards }})
                .then((dashboards) => {
                    if (!dashboards || dashboards.length !== data.input.dashboards.length) {
                        logger.error('one or more dashboard not found:' + data.id);
                        resolve({ success: false, errors: [ { field: 'dashboards', errors: ['one or more dashboards not found'] } ]});
                        return;
                    }

                    // create the chart
                    that._chartModel.createChart(data.input)
                    .then((chart) => {
                        attachToDashboards(that._dashboardModel, data.input.dashboards, chart._id)
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

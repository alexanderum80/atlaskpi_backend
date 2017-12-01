import { MutationBase } from '../../mutation-base';
import { attachToDashboards } from './common';
import { IChartModel } from '../../../models/app/charts';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import { IKPIModel } from '../../../models/app/kpis';
import { IDashboardModel } from '../../../models/app/dashboards';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class DeleteDashboardMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _dashboardModel: IDashboardModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        // resolve kpis
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._dashboardModel.deleteDashboard(data.id)
            .then(dashboard => {
                    resolve({
                        success: true,
                        entity: dashboard
                    });
            }).catch(err => {
                    resolve({
                        success: false,
                        errors: [
                            {
                                field: 'general',
                                errors: ['There was an error deleting the dashboard']
                            }
                        ]
                    });
            });
        });
    }
}

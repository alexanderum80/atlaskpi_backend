import { MutationBase } from '../../mutation-base';
import { attachToDashboards } from './common';
import { IChartModel } from '../../../models/app/charts';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import { IKPIModel } from '../../../models/app/kpis';
import { IDashboardModel } from '../../../models/app/dashboards';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class UpdateDashboardMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _DashboardModel: IDashboardModel) {
            super(identity);
        }

    run(data: { _id: string, name: string, description: string, group: string, charts: any[], users?: string[] }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._DashboardModel.updateDashboard(data._id, data.name, data.description,
            data.group, data.charts, data.users).then(dashboard => {
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
                            errors: ['There was an error updating the dashboard']
                        }
                    ]
                });
           });
        });
    }
}

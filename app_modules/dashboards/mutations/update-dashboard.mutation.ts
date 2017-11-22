import { IDashboardInput } from './../../../models/app/dashboards/IDashboard';
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

    run(data: { id: string, input: IDashboardInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._DashboardModel.updateDashboard(data.id, data.input).then(dashboard => {
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

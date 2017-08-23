import { MutationBase } from '../../mutation-base';
import { detachFromDashboards } from './common';
import { IChartModel } from '../../../models/app/charts';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import { IDashboardDocument, IDashboardModel } from '../../../models/app/dashboards';

export class DeleteChartMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _chartModel: IChartModel,
        private _dashboardModel: IDashboardModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!data.id ) {
                return reject({ success: false,
                                 errors: [ { field: 'id', errors: ['Chart not found']} ] });
              }
            that._chartModel.findOne({ _id: data.id})
            .exec()
            .then((chart) => {
                if (!chart) {
                    reject({ success: false,
                             errors: [ { field: 'id', errors: ['Chart not found']} ] });
                    return;
                }

                detachFromDashboards(that._dashboardModel, chart)
                .then(() => {
                    chart.remove().then(() =>  {
                        resolve({ success: true });
                        return;
                    });
                });
            })
            .catch(err => reject({ success: false, errors: [ { field: 'id', errors: [err]} ] }));
        });

    }
}

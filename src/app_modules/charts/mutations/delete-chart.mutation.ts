import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Charts } from '../../../domain';
import { Dashboards } from '../../../domain/app/dashboards';
import { IMutationResponse, mutation, MutationBase } from '../../../framework';
import { detachFromAllDashboards } from '../../dashboards/mutations/common';
import { DeleteChartActivity } from '../activities';
import { ChartMutationResponse } from '../charts.types';

@injectable()
@mutation({
    name: 'deleteChart',
    activity: DeleteChartActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: ChartMutationResponse }
})
export class DeleteChartMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject('Charts') private _charts: Charts,
        @inject('Dashboards') private _dashboards: Dashboards) {
        super();
    }

    run(data: { id: String }): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!data.id ) {
                return reject({ success: false,
                                 errors: [ { field: 'id', errors: ['Chart not found']} ] });
              }
            that._charts.model.findOne({ _id: data.id})
            .exec()
            .then((chart) => {
                if (!chart) {
                    reject({ success: false,
                             errors: [ { field: 'id', errors: ['Chart not found']} ] });
                    return;
                }

                detachFromAllDashboards(that._dashboards.model, chart._id)
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

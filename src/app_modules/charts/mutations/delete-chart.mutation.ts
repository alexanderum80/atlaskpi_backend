import { detachFromAllDashboards } from './common';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Charts } from '../../../domain/app/charts/chart.model';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteChartActivity } from '../activities/delete-chart.activity';
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

import { Charts } from '../../../domain/app/charts';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { KPIs } from '../../../domain';
import { KPIRemoveResponse } from '../kpis.types';
import { RemoveKPIActivity } from '../activities';

@injectable()
@mutation({
    name: 'removeKPI',
    activity: RemoveKPIActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: KPIRemoveResponse }
})
export class RemoveKpiMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject('KPIs') private _kpis: KPIs,
        @inject('Charts') private _charts: Charts
    ) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!data.id) {
                return reject({ success: false,
                                errors: [ { field: 'id', errors: ['Chart not found']} ] });
            }
            let findCharts = this._charts.model.find({ kpis: { $in: [data.id] } })
                .populate('kpis', '-_id, name')
                .then(kpis => {
                    if (kpis) {
                        return kpis;
                    }
                });
            let promises = findCharts;

            return Promise.all(promises).then(chartExists => {
                return this._kpis.model.removeKPI(data.id, chartExists).then(chart => {
                    const listCharts = Array.isArray(chart) ? chart : [chart];
                    return resolve({ success: true, entity: listCharts});
                });
            }).catch(err => {
                return resolve({ success: false, entity: err.entity, errors: [ { field: 'kpis', errors: [err.errors[0].errors] } ] });
            });
        });
    }
}

import { MutationBase } from '../../mutation-base';
import { IMutationResponse } from '../../../models/common';
import * as Promise from 'bluebird';
import { IIdentity, IKPIModel, IChartModel } from '../../..';
import { IMutation, IValidationResult } from '../..';

export class RemoveKPIMutation extends MutationBase<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _KPIModel: IKPIModel,
                private _ChartModel?: IChartModel) {
                    super(identity);
                }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!data.id) {
                return reject({ success: false,
                                errors: [ { field: 'id', errors: ['Chart not found']} ] });
            }
            let findCharts = this._ChartModel.find({ kpis: { $in: [data.id] } })
                .populate('kpis', '-_id, name')
                .then(kpis => {
                    if (kpis) {
                        return kpis;
                    }
                });
            let promises = findCharts;

            return Promise.all(promises).then(chartExists => {
                return this._KPIModel.removeKPI(data.id, chartExists).then(chart => {
                    const listCharts = Array.isArray(chart) ? chart : [chart];
                    return resolve({ success: true, entity: listCharts});
                });
            }).catch(err => {
                resolve({ success: false, entity: err.entity, errors: [ { field: 'kpi', errors: [err.error]}]});
            });
        });
    }
}

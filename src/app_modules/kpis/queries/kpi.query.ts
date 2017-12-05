import { IKPIDocument } from '../../../domain/app/kpis';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { KPIs } from '../../../domain';
import { KPI } from '../kpis.types';
import { GetKpiActivity } from '../activities';

@injectable()
@query({
    name: 'kpi',
    activity: GetKpiActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: KPI }
})
export class KpiQuery extends QueryBase<IKPIDocument> {
    constructor(@inject('KPIs') private _kpis: KPIs) {
        super();
    }

    run(data: { id: string }): Promise<IKPIDocument> {
        console.log(data);
        const that = this;
        return new Promise<IKPIDocument>((resolve, reject) => {
            that._kpis.model
                .findOne({ _id: data.id })
                .then((kpiDocument) => {
                    resolve(kpiDocument);
                })
                .catch(e => reject(e));
        });
    }
}

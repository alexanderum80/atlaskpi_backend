import * as Promise from 'bluebird';
import * as console from 'console';
import { inject, injectable } from 'inversify';

import { IKPIDocument } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetKpiActivity } from '../activities/get-kpi.activity';
import { KPI } from '../kpis.types';

@injectable()
@query({
    name: 'kpi',
    activity: GetKpiActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: KPI }
})
export class KpiQuery implements IQuery<IKPIDocument> {

    constructor(@inject('KPIs') private _kpis: KPIs) { }

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

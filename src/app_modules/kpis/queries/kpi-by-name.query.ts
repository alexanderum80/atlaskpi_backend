import * as Promise from 'bluebird';
import * as console from 'console';
import { inject, injectable } from 'inversify';

import { IKPIDocument } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { KPI } from '../kpis.types';
import { GetKpiByNameActivity } from '../activities/get-kpi-by-name.activity';

@injectable()
@query({
    name: 'kpiByName',
    activity: GetKpiByNameActivity,
    parameters: [
        { name: 'name', type: String },
    ],
    output: { type: KPI }
})
export class KpiByNameQuery implements IQuery<IKPIDocument> {

    constructor(@inject(KPIs.name) private _kpis: KPIs) { }

    run(data: { name: string }): Promise<IKPIDocument> {
        console.log(data);
        const that = this;
        return new Promise<IKPIDocument>((resolve, reject) => {
            that._kpis.model
                .findOne({ name: data.name })
                .then((kpiDocument) => {
                    resolve(kpiDocument);
                })
                .catch(e => reject(e));
        });
    }
}

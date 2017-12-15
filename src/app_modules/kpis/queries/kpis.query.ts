import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IKPIDocument } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetKpisActivity } from '../activities/get-kpis.activity';
import { KPI } from '../kpis.types';


@injectable()
@query({
    name: 'kpis',
    activity: GetKpisActivity,
    output: { type: KPI, isArray: true }
})
export class KpisQuery implements IQuery<IKPIDocument[]> {
    constructor(@inject('KPIs') private _kpis: KPIs) { }

    run(data: { id: string }): Promise<IKPIDocument[]> {
        const that = this;
        return new Promise<IKPIDocument[]>((resolve, reject) => {
             return that._kpis.model
                   .find()
                   .then((kpis) => {
                       resolve(kpis);
                   })
                   .catch(e => reject(e));
        });
    }
}

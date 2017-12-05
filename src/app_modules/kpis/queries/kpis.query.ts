import { isArray } from 'util';
import { IKPIDocument } from '../../../domain/app/kpis';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { KPIs } from '../../../domain';
import { KPI } from '../kpis.types';
import { GetKpisActivity } from '../activities';

@injectable()
@query({
    name: 'kpis',
    activity: GetKpisActivity,
    output: { type: KPI, isArray: true }
})
export class KpisQuery extends QueryBase<IKPIDocument[]> {
    constructor(@inject('KPIs') private _kpis: KPIs) {
        super();
    }

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

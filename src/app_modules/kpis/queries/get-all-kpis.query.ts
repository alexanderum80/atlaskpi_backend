
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { KPIs } from '../../../domain';
import { KPIPagedQueryResult } from '../kpis.types';
import { GetAllKPIsActivity } from '../activities';
import { PaginationDetails } from '../../shared';

@injectable()
@query({
    name: 'getAllKPIs',
    activity: GetAllKPIsActivity,
    parameters: [
        { name: 'details', type: PaginationDetails },
    ],
    output: { type: KPIPagedQueryResult }
})
export class GetAllKpIsQuery extends QueryBase<KPIPagedQueryResult> {
    constructor(@inject('Kpis') private _kpis: KPIs) {
        super();
    }

    run(data: { details: PaginationDetails,  }): Promise<KPIPagedQueryResult> {
        return this._kpis.model.getAllKPIs(data);
    }
}

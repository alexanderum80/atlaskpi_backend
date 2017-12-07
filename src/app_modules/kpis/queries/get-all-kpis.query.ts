
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
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
export class GetAllKpIsQuery implements IQuery<KPIPagedQueryResult> {

    constructor(@inject('Kpis') private _kpis: KPIs) { }

    run(data: { details: PaginationDetails }): Promise<KPIPagedQueryResult> {
        return this._kpis.model.getAllKPIs(data);
    }
}

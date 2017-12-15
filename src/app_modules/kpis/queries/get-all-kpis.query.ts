import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { KPIs } from '../../../domain';
import { KPIPagedQueryResult } from '../kpis.types';
import { GetAllKPIsActivity } from '../activities';
import { PaginationDetails } from '../../shared';
import { IPaginationDetails, IPagedQueryResult } from '../../../framework/queries/pagination';
import { IKPI } from '../../../domain/app/kpis/kpi';

@injectable()
@query({
    name: 'getAllKPIs',
    activity: GetAllKPIsActivity,
    parameters: [
        { name: 'details', type: PaginationDetails },
    ],
    output: { type: KPIPagedQueryResult }
})
export class GetAllKpIsQuery implements IQuery<IPagedQueryResult<IKPI>> {

    constructor(@inject('Kpis') private _kpis: KPIs) { }

    run(data: IPaginationDetails): Promise<IPagedQueryResult<IKPI>> {
        return this._kpis.model.getAllKPIs(data);
    }
}

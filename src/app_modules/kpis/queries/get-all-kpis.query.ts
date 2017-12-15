import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { PaginationDetails } from '../../shared/shared.types';
import { GetAllKPIsActivity } from '../activities/get-all-kpis.activity';
import { KPIPagedQueryResult } from '../kpis.types';

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

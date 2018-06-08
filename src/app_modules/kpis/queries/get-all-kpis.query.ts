import { inject, injectable } from 'inversify';

import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { PaginationDetails } from '../../shared/shared.types';
import { GetAllKPIsActivity } from '../activities/get-all-kpis.activity';
import { KPIPagedQueryResult } from '../kpis.types';

import { IPaginationDetails, IPagedQueryResult } from '../../../framework/queries/pagination';
import { IKPI } from '../../../domain/app/kpis/kpi';
import {KpiService} from '../../../services/kpi.service';
import { KPI } from '../kpis.types';
import { IKPIDocument } from '../../../domain/app/kpis/kpi';

@injectable()
@query({
    name: 'getAllKPIs',
    activity: GetAllKPIsActivity,
    parameters: [
        { name: 'details', type: PaginationDetails },
    ],
    output: { type: KPI, isArray: true }
})
export class GetAllKpIsQuery implements IQuery<IKPIDocument[]> {

    constructor(@inject(KpiService.name) private _kpiSvc: KpiService) { }

    async run(data: any): Promise<IKPIDocument[]> {
        return await this._kpiSvc.getKpisAndFieldsWithData();
    }
}

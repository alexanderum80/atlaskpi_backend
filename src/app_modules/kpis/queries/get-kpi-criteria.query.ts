import { Appointments } from './../../../domain/app/appointments/appointment-model';
import { Inventory } from './../../../domain/app/inventory/inventory.model';
import { Expenses } from '../../../domain/app/expenses/expense.model';
import { Sales } from '../../../domain/app/sales/sale.model';
import { Calls } from '../../../domain/app/calls/call.model';
import { KPICriteriaResult, KPIFilterCriteria } from '../kpis.types';
import { GetKpiCriteriaActivity } from '../activities/get-kpi-criteria.activity';
import { inject, injectable } from 'inversify';
// import * as Promise from 'bluebird';
import { flatten } from 'lodash';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { DataSourcesService } from '../../../services/data-sources.service';

export interface IKPIMapper {
 sales: Sales;
 expenses: Expenses;
 inventory: Inventory;
 calls: Calls;
 appointments: Appointments;
}


@injectable()
@query({
    name: 'kpiCriteria',
    activity: GetKpiCriteriaActivity,
    parameters: [
        { name: 'input', type: KPIFilterCriteria }
    ],
    output: { type: KPICriteriaResult }
})
export class GetKpisCriteriaQuery implements IQuery<KPICriteriaResult> {
    constructor(
        @inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService
    ) {}

    async run(data: { input: KPIFilterCriteria }): Promise<KPICriteriaResult> {
        const input = data.input;

        try {
            const criteria = await this._dataSourcesSvc.getDistinctValues(input.source, input.field, input.limit, input.filter);
            return {
                criteriaValue: criteria
            };
        } catch (e) {
            return {
                criteriaValue: null,
                errors: [{ field: '', errors: ['An error ocurred while retrieving criterias'] }]
            };
        }

    }
}
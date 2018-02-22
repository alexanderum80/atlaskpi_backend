import { Appointments } from './../../../domain/app/appointments/appointment-model';
import { Inventory } from './../../../domain/app/inventory/inventory.model';
import { Expenses } from '../../../domain/app/expenses/expense.model';
import { Sales } from '../../../domain/app/sales/sale.model';
import { Calls } from '../../../domain/app/calls/call.model';
import { KPICriteriaResult, KPIFilterCriteria } from '../kpis.types';
import { GetKpiCriteriaActivity } from '../activities/get-kpi-criteria.activity';
import { inject, injectable } from 'inversify';
import * as Promise from 'bluebird';
import { flatten } from 'lodash';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';

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
        @inject(Sales.name) private _sales: Sales,
        @inject(Expenses.name) private _expenses: Expenses,
        @inject(Inventory.name) private _inventory: Inventory,
        @inject(Calls.name) private _calls: Calls,
        @inject(Appointments.name) private _appointments: Appointments
    ) {}

    run(data: { input: KPIFilterCriteria }): Promise<KPICriteriaResult> {
        const that: GetKpisCriteriaQuery = this;
        const input: KPIFilterCriteria = data.input;

        const kpiMapper: IKPIMapper = {
            'sales': this._sales,
            'expenses': this._expenses,
            'inventory': this._inventory,
            'calls': this._calls,
            'appointments': this._appointments
        };

        return new Promise<KPICriteriaResult>((resolve, reject) => {
            if (!input.kpi || !input.field) {
                reject({ message: 'Did not provide the fields', error: 'Did not provide the fields' });
                return;
            }

            // sales, expenses, inventory model
            const kpi: any = kpiMapper[input.kpi.toLocaleLowerCase()].model;

            if (kpi) {
                kpi.findCriteria(input.field, input.limit, input.filter).then((response: string[]) => {
                    resolve({
                        criteriaValue: response
                    });
                    return;
                }).catch(err => {
                    reject({ message: 'unable to get data', errors: err});
                });
            } else {
                reject({ message: 'no kpi provided', errors: 'no kpi provided' });
                return;
            }
        });
    }
}
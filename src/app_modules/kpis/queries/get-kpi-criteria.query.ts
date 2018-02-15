import { Appointments } from './../../../domain/app/appointments/appointment-model';
import { Inventory } from './../../../domain/app/inventory/inventory.model';
import { Expenses } from '../../../domain/app/expenses/expense.model';
import { Sales } from '../../../domain/app/sales/sale.model';
import { Calls } from '../../../domain/app/calls/call.model';
import { KPICriteriaResult } from '../kpis.types';
import { GetKpiCriteriaActivity } from '../activities/get-kpi-criteria.activity';
import { inject, injectable } from 'inversify';
import * as Promise from 'bluebird';
import { flatten } from 'lodash';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';

@injectable()
@query({
    name: 'kpiCriteria',
    activity: GetKpiCriteriaActivity,
    parameters: [
        { name: 'kpi', type: String, required: true },
        { name: 'field', type: String, required: true }
    ],
    output: { type: KPICriteriaResult }
})
export class GetKpisCriteriaQuery implements IQuery<any> {
    constructor(
        @inject(Sales.name) private _sales: Sales,
        @inject(Expenses.name) private _expenses: Expenses,
        @inject(Inventory.name) private _inventory: Inventory,
        @inject(Calls.name) private _calls: Calls,
        @inject(Appointments.name) private _appointments: Appointments
    ) {}

    run(data: { kpi: string, field: string}): Promise<any> {
        const that = this;
        const kpiMapper = {
            'sales': this._sales,
            'expenses': this._expenses,
            'inventory': this._inventory,
            'calls': this._calls,
            'appointments': this._appointments
        };

        return new Promise<any>((resolve, reject) => {
            if (!data.kpi || !data.field) {
                reject({ message: 'Did not provide the fields', error: 'Did not provide the fields' });
                return;
            }

            // sales, expenses, inventory
            const kpi = kpiMapper[data.kpi.toLocaleLowerCase()].model;

            if (kpi) {
                kpi.findCriteria(data.field).then(response => {
                    resolve({
                        criteriaValue: response
                    });
                    return;
                }).catch(err => {
                    reject({ message: 'unable to get data', error: err});
                });
            } else {
                reject({ message: 'no kpi provided', error: 'no kpi provided' });
                return;
            }
        });
    }
}
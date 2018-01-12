import { Inventory } from '../../../domain/app/inventory/inventory.model';
import { Appointments } from '../../../domain/app/appointments/appointment-model';
import { Expenses } from '../../../domain/app/expenses/expense.model';
import { Worklogs } from '../../../domain/app/work-log/work-log.model';
import { Sales } from '../../../domain/app/sales/sale.model';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { ReloadDataActivity } from '../activities/reload-data.activity';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { importSpreadSheet } from '../../../app_modules/google-spreadsheet/google-sheet.processor';
import { ImportResult } from '../google-spreedsheet.types';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { inject, injectable } from 'inversify';
import * as Promise from 'bluebird';

@injectable()
@mutation({
    name: 'refreshDataFromSpreadSheet',
    activity: ReloadDataActivity,
    parameters: [
        { name: 'customer', type: GraphQLTypesMap.String }
    ],
    output: { type: ImportResult, isArray: true }
})
export class ReloadDataMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Sales.name) private _saleModel: Sales,
        @inject(Worklogs.name) private _worklogModel: Worklogs,
        @inject(Expenses.name) private _expenseModel: Expenses,
        @inject(Appointments.name) private _appointmentModel: Appointments,
        @inject(Inventory.name) private _inventoryModel: Inventory
    ) {
        super();
    }
    run(): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            const ctx = {
                Sale: that._saleModel.model,
                WorkLog: that._worklogModel.model,
                Expense: that._expenseModel.model,
                AppointmentModel: that._appointmentModel.model,
                Inventory: that._appointmentModel.model
            };
            importSpreadSheet(ctx).then(result => {
                resolve(result);
                return;
            }).catch(err => {
                reject(err);
                return;
            });
        });
    }
}


// export const refreshDataFromSpreadSheet = function(customer: string) {
//     return importSpreadSheet;
// };
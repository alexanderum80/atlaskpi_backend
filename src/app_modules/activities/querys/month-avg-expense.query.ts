import { from } from 'apollo-link/lib';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ExpensesAmount } from '../activities.types';
import { parsePredifinedDate } from '../../../domain/common/date-range';
import { MonthAvgExpensesActivity } from '../activities/month-avg-expenses.activity';
import { Expenses } from '../../../domain/app/expenses/expense.model';

@injectable()
@query({
    name: 'monthAvgExpenses',
    activity: MonthAvgExpensesActivity,
    parameters: [
        { name: 'date', type: String, required: true },
    ],
    output: { type: ExpensesAmount, isArray: true }
})
export class MonthAvgExpensesQuery extends MutationBase<Object> {
    constructor(@inject(Expenses.name) private _expenses: Expenses) {
        super();
    }

    run(data: { date: string }): Promise<Object> {
        return this._expenses.model.monthsAvgExpense(data.date);
    }
}

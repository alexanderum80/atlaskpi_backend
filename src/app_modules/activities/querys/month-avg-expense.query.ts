import { inject, injectable } from 'inversify';

import { Expenses } from '../../../domain/app/expenses/expense.model';
import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ExpensesAmount } from '../activities.types';
import { MonthAvgExpensesActivity } from '../activities/month-avg-expenses.activity';

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

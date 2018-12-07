import { inject, injectable } from 'inversify';

import { Expenses } from '../../../domain/app/expenses/expense.model';
import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ExpensesAmount } from '../activities.types';
import { ExpensesAmountByDateActivity } from '../activities/expenses-amount-by-date.activity';

@injectable()
@query({
    name: 'expensesAmountByDateRange',
    activity: ExpensesAmountByDateActivity,
    parameters: [
        { name: 'from', type: String, required: true },
        { name: 'to', type: String, required: true },
    ],
    output: { type: ExpensesAmount, isArray: true }
})
export class ExpensesAmountByDateRangeQuery extends MutationBase<Object> {
    constructor(@inject(Expenses.name) private _expenses: Expenses) {
        super();
    }

    run(data: { from: string, to: string }): Promise<Object> {
        return this._expenses.model.amountByDateRange(data.from, data.to);
    }
}

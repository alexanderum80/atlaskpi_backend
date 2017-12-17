import { Expenses } from '../../../domain/app/expenses/expense.model';
import { from } from 'apollo-link/lib';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ExpensesAmount } from '../activities.types';
import { parsePredifinedDate } from '../../../domain/common/date-range';
import { ExpensesAmountByDateActivity } from '../activities/expenses-amount-by-date.activity';

@injectable()
@query({
    name: 'expensesAmountByDateRange',
    activity: ExpensesAmountByDateActivity,
    parameters: [
        { name: 'predefinedDateRange', type: String, required: true },
    ],
    output: { type: ExpensesAmount, isArray: true }
})
export class ExpensesAmountByDateRangeQuery extends MutationBase<Object> {
    constructor(@inject(Expenses.name) private _expenses: Expenses) {
        super();
    }

    run(data: { predefinedDateRange: string }): Promise<Object> {
        return this._expenses.model.amountByDateRange(data.predefinedDateRange);
    }
}

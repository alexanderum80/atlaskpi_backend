import { isArray } from 'util';
import { from } from 'apollo-link/lib';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ISaleDocument } from '../../../domain/app/sales/sale';
import { Sales } from '../../../domain/app/sales/sale.model';
import { MonthAvgSalesAmount } from '../activities.types';
import { parsePredefinedDate } from '../../../domain/common/date-range';
import { MonthAvgSalesActivity } from '../activities/month-avg-sales.activity';

@injectable()
@query({
    name: 'monthAvgSales',
    activity: MonthAvgSalesActivity,
    parameters: [
        { name: 'date', type: String, required: true },
    ],
    output: { type: MonthAvgSalesAmount, isArray: true }
})
export class MonthAvgSalesQuery extends MutationBase<Object> {
    constructor(@inject(Sales.name) private _sales: Sales) {
        super();
    }

    run(data: { date: string }): Promise<Object> {
        return this._sales.model.monthsAvgSales(data.date);
    }
}

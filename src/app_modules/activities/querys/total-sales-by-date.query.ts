import { from } from 'apollo-link/lib';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ISaleDocument } from '../../../domain/app/sales/sale';
import { Sales } from '../../../domain/app/sales/sale.model';
import { SalesAmount } from '../activities.types';
import { parsePredifinedDate } from '../../../domain/common/date-range';
import { TotalSalesByDateActivity } from '../activities/total-sales-by-date.activity';

@injectable()
@query({
    name: 'totalSalesByDateRange',
    activity: TotalSalesByDateActivity,
    parameters: [
        { name: 'from', type: String, required: true },
        { name: 'to', type: String, required: true },
    ],
    output: { type: SalesAmount, isArray: true }
})
export class TotalSalesByDateRangeQuery extends MutationBase<Object> {
    constructor(@inject(Sales.name) private _sales: Sales) {
        super();
    }

    run(data: { from: string, to: string }): Promise<Object> {
        return this._sales.model.totalSalesByDateRange(data.from, data.to);
    }
}

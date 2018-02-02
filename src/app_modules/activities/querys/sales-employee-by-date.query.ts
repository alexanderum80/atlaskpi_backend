import { from } from 'apollo-link/lib';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ISaleDocument } from '../../../domain/app/sales/sale';
import { Sales } from '../../../domain/app/sales/sale.model';
import { SalesAmount } from '../activities.types';
import { parsePredifinedDate } from '../../../domain/common/date-range';
import { SalesEmployeeByDateActivity } from '../activities/sales-employee-by-date.activity';

@injectable()
@query({
    name: 'salesEmployeeByDateRange',
    activity: SalesEmployeeByDateActivity,
    parameters: [
        { name: 'predefinedDateRange', type: String, required: true },
    ],
    output: { type: SalesAmount, isArray: true }
})
export class SalesEmployeeByDateRangeQuery extends MutationBase<Object> {
    constructor(@inject(Sales.name) private _sales: Sales) {
        super();
    }

    run(data: { predefinedDateRange: string }): Promise<Object> {
        return this._sales.model.salesEmployeeByDateRange(data.predefinedDateRange);
    }
}

import { inject, injectable } from 'inversify';

import { Sales } from '../../../domain/app/sales/sale.model';
import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { SalesAmount } from '../activities.types';
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

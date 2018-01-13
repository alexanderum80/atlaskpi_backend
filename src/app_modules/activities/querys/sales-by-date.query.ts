import { SalesByDateActivity } from '../activities/sales-by-date.activity';
import { from } from 'apollo-link/lib';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ISaleDocument } from '../../../domain/app/sales/sale';
import { Sales } from '../../../domain/app/sales/sale.model';
import { Sale } from '../activities.types';

@injectable()
@query({
    name: 'salesByDate',
    activity: SalesByDateActivity,
    parameters: [
        { name: 'date', type: String, required: true },
    ],
    output: { type: Sale, isArray: true }
})
export class SalesByDateQuery extends MutationBase<ISaleDocument[]> {
    constructor(@inject(Sales.name) private _sales: Sales) {
        super();
    }

    run(data: { date: string }): Promise<ISaleDocument[]> {
        return this._sales.model.findByPredefinedDate(data.date);
    }
}

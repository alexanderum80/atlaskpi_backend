import { from } from 'apollo-link/lib';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { ISaleDocument } from '../../../domain/app/sales/sale';
import { Sales } from '../../../domain/app/sales/sale.model';
import { Sale } from '../activities.types';
import { parsePredifinedDate } from '../../../domain/common/date-range';
import { YesterdaySalesActivity } from '../activities/yesterday-sales.activity';

@injectable()
@query({
    name: 'yesterdaySales',
    activity: YesterdaySalesActivity,
    output: { type: Sale, isArray: true }
})
export class YesterdaySalesQuery extends MutationBase<ISaleDocument[]> {
    constructor(@inject(Sales.name) private _sales: Sales) {
        super();
    }

    run(): Promise<ISaleDocument[]> {
        return this._sales.model.findYesterday();
    }
}

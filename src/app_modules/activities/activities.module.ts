import { SalesAmountByDateRangeQuery } from './querys/sales-amount-by-date.query';
import { YesterdaySalesQuery } from './querys/sales-by-date.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';

@AppModule({
    queries: [
        YesterdaySalesQuery,
        SalesAmountByDateRangeQuery
    ]
})
export class ActivitiesModule extends ModuleBase { }
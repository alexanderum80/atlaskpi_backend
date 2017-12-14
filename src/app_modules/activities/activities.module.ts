import { SalesAmountByDateRangeQuery } from './querys/sales-amount-by-date.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';

@AppModule({
    queries: [
        SalesAmountByDateRangeQuery
    ]
})
export class ActivitiesModule extends ModuleBase { }
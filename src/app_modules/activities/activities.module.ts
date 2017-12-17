import { ExpensesAmountByDateRangeQuery } from './querys/expenses-amount-by-date.query';
import { SalesEmployeeByDateRangeQuery } from './querys/sales-employee-by-date.query';
import { SalesAmountByDateRangeQuery } from './querys/sales-amount-by-date.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { TargetByDateQuery } from './querys/target-by-date.query';
import { MonthAvgSalesQuery } from './querys/month-avg-sales.query';

@AppModule({
    queries: [
        SalesAmountByDateRangeQuery,
        SalesEmployeeByDateRangeQuery,
        ExpensesAmountByDateRangeQuery,
        TargetByDateQuery,
        MonthAvgSalesQuery
    ]
})
export class ActivitiesModule extends ModuleBase { }
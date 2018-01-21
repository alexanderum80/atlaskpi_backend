import { MonthAvgExpensesQuery } from './querys/month-avg-expense.query';
import { ExpensesAmountByDateRangeQuery } from './querys/expenses-amount-by-date.query';
import { SalesEmployeeByDateRangeQuery } from './querys/sales-employee-by-date.query';
import { SalesAmountByDateRangeQuery } from './querys/sales-amount-by-date.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { TargetByDateQuery } from './querys/target-by-date.query';
import { MonthAvgSalesQuery } from './querys/month-avg-sales.query';
import { UsersActivityByDateRangeQuery } from './querys/users-activity-by-date.query';

@AppModule({
    queries: [
        SalesAmountByDateRangeQuery,
        SalesEmployeeByDateRangeQuery,
        ExpensesAmountByDateRangeQuery,
        TargetByDateQuery,
        MonthAvgSalesQuery,
        MonthAvgExpensesQuery,
        UsersActivityByDateRangeQuery
    ]
})
export class ActivitiesModule extends ModuleBase { }
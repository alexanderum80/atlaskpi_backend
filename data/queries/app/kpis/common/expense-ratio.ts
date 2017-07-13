import { IExpenseModel } from '../../../../models/app/expenses';
import { ISaleModel } from '../../../../models/app/sales';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import { TotalExpense } from '../common/total-expense';
import { TotalRevenue } from '../common/total-revenue';
import { RatioExpensesCalculatorKPI } from '../common/ratio-expenses-calculator-kpi';
import { IKpiBase } from '../kpi-base';
import * as Promise from 'bluebird';

export class ExpenseRatio implements IKpiBase {

    constructor(private expenses: IExpenseModel, private sales: ISaleModel) {}

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        const self = this;
        const totalRevenue = new TotalRevenue(this.sales);
        const totalExpense = new TotalExpense(this.expenses);
        const ratioKPI = new RatioExpensesCalculatorKPI(totalExpense, totalRevenue);

        return new Promise((resolve, reject) => {
            ratioKPI.getData(dateRange, frequency).then(data => {
                resolve(self._toSeries(data));
            });
        });

    }
    private _toSeries(rawData: any[]) {
        return [{
            name: 'Expense By Ratio',
            data: rawData.map((item) => [item._id.frequency, item.ratio])
        }];
    }
}
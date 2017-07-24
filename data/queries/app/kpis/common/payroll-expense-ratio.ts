import { IExpenseModel } from '../../../../models/app/expenses';
import { ISaleModel } from '../../../../models/app/sales';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import { TotalRevenue } from '../common/total-revenue';
import { TotalPayroll } from './total-payroll';
import { PayrollExpenseCalculator } from './payroll-expense-calculator-kpi';
import { KpiBase, IKpiBase } from '../kpi-base';
import * as Promise from 'bluebird';

export class PayrollExpenseRatio implements IKpiBase {
    constructor(private payrollExpense: IExpenseModel, private payrollRevenue: ISaleModel) { }

    getData(dateRange: IDateRange, frequency: FrequencyEnum): Promise<any> {
        let self = this;
        let myExpense = new TotalPayroll(this.payrollExpense);
        let myRevenue = new TotalRevenue(this.payrollRevenue);

        let _payrollCalculuator = new PayrollExpenseCalculator(myExpense, myRevenue);
        
        return <any>(_payrollCalculuator.getData(dateRange, frequency));
    }

    getSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        const that = this;
        return new Promise((resolve, reject) => {
            this.getData(dateRange, frequency).then(data => {
                resolve(that._toSeries(data));
            })
        })
    }
    
    private _toSeries(rawData: any[]) {
        return [{
            name: 'Payroll Expense Ratio',
            data: rawData.map(item => [ item._id.frequency, item.value ])
        }];
    }
    
}
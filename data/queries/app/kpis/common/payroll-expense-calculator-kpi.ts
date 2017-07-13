import { IKpiBase } from '../kpi-base';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

export class PayrollExpenseCalculator {
    constructor(private payrollKpi: IKpiBase, private revenueKpi) {}

    getData(dateRange: IDateRange, frequency: FrequencyEnum): Promise<any> {
        const self = this;

        let payroll;
        let revenue;

        return this.revenueKpi.getData(dateRange, frequency).then(p => {
            payroll = p;
            return self.payrollKpi.getRawData(dateRange, frequency);
        }).then(r => {
            revenue = r;
            return self._calPayrollRevenu(payroll, revenue);
        });
    }
    _calPayrollRevenu(s: any, r: any): Promise<any> {
        let payrollRatio = [];
        const self = this;
        r.forEach(t => {
        let ratio = self.getPayrollRatioByRevenue(t._id.frequency, s, r);
        if (!ratio) { return; }
        payrollRatio.push({ _id: { frequency: t._id.frequency },
                                    ratio: ratio });
        });
        return Promise.resolve(payrollRatio);
    }
    getPayrollRatioByRevenue(frequencyItem: string, payrollRevenue: any[], totalRevenue: any[]) {
        let mySale = payrollRevenue.find(h => h._id.frequency === frequencyItem);
        let myRevenue = totalRevenue.find(h => h._id.frequency === frequencyItem);

        if (!myRevenue || myRevenue.revenue === 0) { return null; };
        if (!mySale) { return 0; };

        // validation check for operand order, to help for debuging
        if (mySale.revenue > myRevenue.revenue) {
            throw 'Total revenue cannot be less than part revenue, give it a try switching the order of the arguments of RatioSalesCalculatorKPI.getData(...)';
        }

        return myRevenue.total / mySale.revenue * 100;
    }
}
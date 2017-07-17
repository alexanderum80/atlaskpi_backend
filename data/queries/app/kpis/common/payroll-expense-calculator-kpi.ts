import { IKpiBase } from '../kpi-base';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

export class PayrollExpenseCalculator {
    constructor(private payrollKpi: IKpiBase, private revenueKpi: IKpiBase) {}

    getData(dateRange: IDateRange, frequency: FrequencyEnum): Promise<any> {
        let self = this;

        let payroll;
        let revenue;

        return this.revenueKpi.getDataToSeries(dateRange, frequency).then(p => {
            payroll = p;
            // rawData
            return self.payrollKpi.getData(dateRange, frequency);
        }).then(r => {
            revenue = r;
            return self._calPayrollRevenue(payroll, revenue);
        })
    }

    getDataToSeries(dateRange: IDateRange, frequency: FrequencyEnum): Promise<any> {
         return this.getData(dateRange, frequency);
    }

    private _calPayrollRevenue(s: any, r: any): Promise<any> {
        let payrollRatio = [];
        let self = this;
        r.forEach(t => {
        let ratio = self.getPayrollRatioByRevenue(t._id.frequency, s, r);
        if (!ratio) { return; }
        payrollRatio.push({ _id: { frequency: t._id.frequency },
                                    value: ratio });
        });
        return Promise.resolve(payrollRatio);
    }

    private getPayrollRatioByRevenue(frequencyItem: string, payrollRevenue: any[], totalRevenue: any[]) {
        let mySale = payrollRevenue.find(h => h._id.frequency === frequencyItem);
        let myRevenue = totalRevenue.find(h => h._id.frequency === frequencyItem);

        if (!myRevenue || myRevenue.value === 0) { return null; };
        if (!mySale) { return 0; };

        // validation check for operand order, to help for debuging
        if (mySale.value > myRevenue.value) {
            throw 'Total revenue cannot be less than part revenue, give it a try switching the order of the arguments of RatioSalesCalculatorKPI.getData(...)';
        }

        return myRevenue.value / mySale.value * 100;
    }
    
}
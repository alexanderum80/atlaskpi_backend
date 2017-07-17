import { IKpiBase } from '../kpi-base';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

export class RatioExpensesCalculatorKPI {

    constructor(private _partKpi: IKpiBase,
                private _totalKpi: IKpiBase) { }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        let totalRevenue;
        let partRevenue;

        return this._totalKpi.getDataToSeries(dateRange, frequency)
             .then((t) => {
                totalRevenue = t;
                return this._partKpi.getData(dateRange, frequency);
            }).then((p) => {
                partRevenue = p;
                return that._calcRatioSales(partRevenue, totalRevenue);
            });
    }

    getDataToSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        return this.getData(dateRange, frequency);
    }

    private _calcRatioSales(part: any[], total: any[]): Promise<any> {
        let expenseRatio = [];

        total.forEach(t => {
                let ratio = this._getSalesRatioByFrequencyItem(t._id.frequency, part, total);
                if (!ratio) { return; }
                expenseRatio.push({ _id: { frequency: t._id.frequency },
                                         value: ratio });
        });
        
        return Promise.resolve(expenseRatio);
    }

    private _getSalesRatioByFrequencyItem(frequencyItem: string, partRevenue: any[], totalRevenue: any[]) {

        let revenueOfFrequencyItem = partRevenue.find(h => h._id.frequency === frequencyItem);

        let totalOfFrequencyItem = totalRevenue.find(h => h._id.frequency === frequencyItem);

        if (!totalOfFrequencyItem || totalOfFrequencyItem.value === 0) { return null; };
        if (!revenueOfFrequencyItem) { return 0; };

        return revenueOfFrequencyItem.value / totalOfFrequencyItem.value * 100;
    }

}

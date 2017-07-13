import { LeftDivRightMult100Kpi } from '../common/L-div-R-x-100';
import { RentExpenses } from './rent-expense';
import { TotalRevenue } from '../common/total-revenue';
import { ISaleModel } from '../../../../models/app/sales';
import { IExpenseModel} from '../../../../models/app/expenses';
import { KpiBase, IKpiBase } from '../kpi-base';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';
import * as _ from 'lodash';


export class RentExpenseRatio {

    constructor(private _sales: ISaleModel,
                private _expenses: IExpenseModel) { }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        const that = this;

        const totalRevenueKpi = new TotalRevenue(this._sales);
        const rentExpense = new RentExpenses(this._expenses, true);

        const rentExpesnesCalc = new LeftDivRightMult100Kpi(rentExpense,
                                                            totalRevenueKpi);

        return new Promise((resolve, reject) => {
            rentExpesnesCalc.getData(dateRange, frequency).then(data => {
                resolve(that._toSeries(data));
            }), (e) => reject(e);
        });
    }

   private _toSeries(rawData: any[]) {
        let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
        let years = _.uniq(frequencies.map(f => { return f.split('-')[0]; }));

        let result = [];

        years.forEach(y => {
            let serie = { name: y,
                          data: this._byYear(rawData, y) };
            result.push(serie);
        });

        return result;
    }

    private _byYear(rawData: any, year: string) {
        let data = rawData.filter(d => {
            if (d._id.frequency.indexOf(year) === -1) { return; };
            return d;
        });

        data = _.sortBy(data, '_id.frequency');
        return data.map(item => [ item._id.frequency, item.calc ]);
    }

}

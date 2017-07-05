import { IExpenseModel } from '../../../../models/app/expenses';
import { AggregateStage } from '../aggregate';
import { KpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

const aggregate: AggregateStage[] = [
    {
        dateRange: true,
        $match:  {
            "expense.concept": "Cost of Good Sold"
        }
    },
    {
        frequency: true,
        $project: { _id: 0, expense: 1 }
    },
    {
        frequency: true,
        $group: {
            expenses: {
                $sum: "$expense.amount"
            }
        }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];

export class CostOfGoodSold extends KpiBase {

   constructor(sales: IExpenseModel) {
        super(sales, aggregate);
    }
    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        const that = this;
        return this.executeQuery('timestamp', dateRange, frequency).then(data => {
            return Promise.resolve(that._toSeries(data, frequency));
        });
    }

    private _toSeries(rawData: any[], frequency: FrequencyEnum) {
        let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
        let years = _.uniq(frequencies.map(f => { return f.split('-')[0]; }));

        let result = [];

        years.forEach(y => {
            let serie = { name: y,
                          data: this._getRevenueByYear(rawData, y) };
            result.push(serie);
        });

        return result;
    }

     private _getRevenueByYear(rawData: any, year: string) {
        let data = rawData.filter(d => {
            if (d._id.frequency.indexOf(year) === -1) { return; };
            return d;
        });

        data = _.sortBy(data, '_id.frequency');
        return data.map(item => [ item._id.frequency, item.expenses ]);
    }
}

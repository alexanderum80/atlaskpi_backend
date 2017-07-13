import { IExpenseModel } from '../../../../models/app/expenses';
import { AggregateStage } from '../aggregate';
import { KpiBase, IKpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

const aggregate: AggregateStage[] = [
    {
        dateRange: true,
        $match:  { }
    },
    {
        $project: { _id: 0, expense: 1, concept: 1 }
    },
    {
        $group: {
            _id: { concept: '$expense.concept' },
            expenses: { $sum: '$expense.amount' }
        }
    },
    {
        $sort: {
            expenses: -1
        }
    }
];

export class ExpenseByCategory extends KpiBase implements IKpiBase {

   constructor(sales: IExpenseModel) {
        super(sales, aggregate);
    }
    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        const that = this;
        return this.executeQuery('timestamp', dateRange).then(data => {
            return Promise.resolve(that._toSeries(data, frequency));
        });
    }

    private _toSeries(rawData: any[], frequency: FrequencyEnum) {
        //let data = this.limitData(rawData, frequency);
     /*   let data = _.orderBy(rawData, "expenses");

        data = _(rawData)
                    .map((v, k) => ({
                        expenses: v.expenses,
                        concept: v._id.concept
                    }))
                    .value()
                    .map(item => [item.concept, item.expenses]);

        let result = [{
            name: 'Expense',
            data: data
        }];
        return result;*/
        let data = this.fiveBest(rawData);
        return [{
            name: 'Expense',
            data: data.filter((item, index) => {
                        return item;
                    })
                    .map(item => [ item._id.concept, item.expenses ])
        }];
    }
    private limitData(rawData: any[], frequency: FrequencyEnum) {
       // var data = _.flatten(rawData);
        return _.filter(rawData, (v, k) => {
            if (k > 5) return;
            return v;
        });
    }
    private fiveBest(rawData: any) {
        var sum = 0;
        var data = rawData;
        var a = data.slice(0,5);
        var b = data.slice(5, data.length);
        for (var i = 0;i < b.length;i++) {
            sum += b[i].expenses;
        }
        
        a.push({
            _id: {
                concept: "Others"
            },
            expenses: sum
        });
        return a;
    }
    private _topFivBestSeller(rawData: any) {
        var sum = 0;
        return  _(rawData)
                .map((v, k) => ({
                    concept: k,
                    expenses: _.sumBy(v, 'expenses')
                }))
                .orderBy('expenses', 'desc')
                .filter((item, index) => {
                    if (index > 5) {
                        sum += item.expenses;
                        return ["Others", sum];
                    }
                    return item;
                })
                .map(item => item.concept);
    }
}